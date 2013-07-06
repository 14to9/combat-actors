// Derived from example Backbone application 'Actors'
$(function(){

  var Actor = Backbone.Model.extend({

    defaults: function() {
      return {
        title: "empty actor...",
        order: '0',
        active: false,
        conditions: []
      };
    },

    addCondition: function(condition){
      newConditions = _.union(this.get('conditions'), [condition]);
      this.save({
        'conditions': newConditions
      });
    },

    removeCondition: function(condition){
      newConditions = _.reject(this.get('conditions'), function(existing_condition){
        return existing_condition === condition;
      });
      this.save({
        'conditions': newConditions
      });
    },
  });

  var ActorList = Backbone.Collection.extend({

    model: Actor,

    localStorage: new Backbone.LocalStorage("actors-backbone"),

    comparator: function(x){
      return - parseInt(x.get('order'),10);
    },

    setActive: function(actor){
      this.where({active: true}).forEach(function(previous) {
        previous.save({active: false});
      });
      actor.save({active: true});
    }

  });

  var Actors = new ActorList;
  // make available in console for testing
  actors = Actors;

  var ActorView = Backbone.View.extend({

    tagName:  "li",

    attributes : {
      'class' : 'actor-item'
    },

    template: _.template($('#item-template').html()),

    events: {
      "dblclick label"  : "edit",
      "click a.destroy" : "clear",
      "click a.activate" : "activate",
      "keypress .edit"  : "updateOnEnter",
      "blur .edit"      : "close",
      "click a.remove"   : "removeCondition",
      "keypress .input"  : "addConditionOnEnter",
      "click .labels"     : "setConditionFocus",
      "dblclick .actor-initiative" : "editInitiative",
      "keypress .actor-initiative input" : "updateInitiative",
      "blur .actor-initiative input"     : "hideInitiative"
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass('active', this.model.get('active'));
      this.input = this.$('.edit');
      this.newCondition = this.$('.editable .editor');
      f = this.editInitiative = this.$('.actor-initiative .edit-form');
      this.showInitiative = this.$('.actor-initiative .show');
      if (this.model.get('active')) {
        this.moveArrow();
      }

      return this;
    },

    moveArrow: function() {
      $("#arrow").position({
        my:        "right+5% center",
        at:        "left center-10%",
        of:        this.$el,
        collision: "none"
      });
    },

    activate: function() {
      Actors.setActive(this.model);
    },

    edit: function() {
      this.$el.addClass("editing");
      this.input.focus();
    },

    editInitiative: function() {
      this.showInitiative.hide();
      this.editInitiative.show();
      this.editInitiative.focus();
    },

    updateInitiative: function(e) {
      if (e.keyCode == 13) {
        var value = this.$('.actor-initiative .edit-form input').val() || 0;
        this.model.save({order: value});
        this.hideInitiative();
      }
    },

    hideInitiative: function() {
      this.showInitiative.show();
      this.editInitiative.hide();
    },

    close: function() {
      var value = this.input.val();
      if (!value) {
        this.clear();
      } else {
        this.model.save({title: value});
        this.$el.removeClass("editing");
      }
    },

    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    setConditionFocus: function(e) {
      this.newCondition.val(null);
      this.newCondition.focus();
    },

    addConditionOnEnter: function(e) {
      if (e.keyCode == 13) {
        var target_id = $(e.target).parent().attr('id');
        var condition = this.newCondition.val().replace(/^\s+|\s+$/g,'');
        this.model.addCondition(condition);
        this.setConditionFocus();
      }
    },

    clear: function() {
      this.model.destroy();
    },

    removeCondition: function(e) {
      var target_id = $(e.target).parent().attr('id');
      var condition = target_id.replace(/-/g , " ");
      this.model.removeCondition(condition);
      return false;
    }

  });

  var AppView = Backbone.View.extend({

    el: $("#actorapp"),

    statsTemplate: _.template($('#stats-template').html()),

    events: {
      "keypress #new-actor":  "createOnEnter",
      "click #activate-next": "activateNext",
      "keypress body": "activateNextOnKeypress"
    },

    initialize: function() {

      this.input = this.$("#new-actor");

      this.listenTo(Actors, 'add', this.addAll);
      this.listenTo(Actors, 'reset', this.addAll);
      this.listenTo(Actors, 'change:order', this.forceSort);
      this.listenTo(Actors, 'sort', this.reset);

      this.footer = this.$('footer');
      this.main = $('#main');
      this.orderList = $("#actor-list");

      Actors.fetch();
    },

    reset: function(){
      this.addAll();
    },

    render: function() {
      var remaining = Actors.remaining().length;

      this.main.show();
      this.footer.show();
    },

    forceSort: function(actor) {
      Actors.sort();
    },

    // Add a single actor item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(actor) {
      var view = new ActorView({model: actor});
      this.orderList.append(view.render().el);
    },

    // Add all items in the **Actors** collection at once.
    addAll: function() {
      this.orderList.empty();
      Actors.each(this.addOne, this);
    },

    activateNext: function() {
      current_index = Actors.indexOf(Actors.where({active:true})[0]) || 0;
      candidate_index  = current_index + 1;
      target_index = candidate_index == Actors.length ? 0 : candidate_index;
      Actors.setActive(Actors.at(target_index));
    },

    activateNextOnKeypress: function(e) {
      if (e.ctrlKey || e.metaKey && (e.keyCode == 65)) {
        console.log("Advancing active on keypress");
        this.activateNext();
      }
    },

    // If you hit return in the main input field, create new **Actor** model,
    // persisting it to *localStorage*.
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;

      Actors.create({title: this.input.val()});
      this.input.val('');
    }

  });

  var App = new AppView;

});

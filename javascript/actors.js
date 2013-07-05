// Derived from example Backbone application 'Actors'
$(function(){

  var Actor = Backbone.Model.extend({

    defaults: function() {
      return {
        title: "empty actor...",
        order: 1,
        done: false,
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

    comparator: 'title',

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
      "dblclick .actor"  : "edit",
      "click a.destroy" : "clear",
      "click a.activate" : "activate",
      "keypress .edit"  : "updateOnEnter",
      "blur .edit"      : "close",
      "click a.remove"   : "removeCondition"
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass('done', this.model.get('done'));
      this.$el.toggleClass('active', this.model.get('active'));
      this.input = this.$('.edit');
      return this;
    },

    activate: function() {
      Actors.setActive(this.model);
    },

    edit: function() {
      this.$el.addClass("editing");
      this.input.focus();
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

    clear: function() {
      this.model.destroy();
    },

    removeCondition: function(e) {
      var target_id = e.target.id;
      var condition = target_id.replace("remove-", "").replace(/-/g , " ");
      this.model.removeCondition(condition);
    }

  });

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#actorapp"),

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template($('#stats-template').html()),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #new-actor":  "createOnEnter",
      "click #clear-completed": "clearCompleted",
      "click #activate-next": "activateNext"
    },

    // At initialization we bind to the relevant events on the `Actors`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting actors that might be saved in *localStorage*.
    initialize: function() {

      this.input = this.$("#new-actor");
      this.allCheckbox = this.$("#toggle-all")[0];

      // this.listenTo(Actors, 'all', this.render);
      this.listenTo(Actors, 'add', this.addAll);
      this.listenTo(Actors, 'reset', this.addAll);
      this.listenTo(Actors, 'change:title', this.forceSort);
      this.listenTo(Actors, 'sort', this.reset);

      this.footer = this.$('footer');
      this.main = $('#main');
      this.orderList = $("#actor-list");

      Actors.fetch();
    },

    reset: function(){
      console.log('reset!');
      this.addAll();
    },

    render: function() {
      console.log('render!');
      var done = Actors.done().length;
      var remaining = Actors.remaining().length;

      this.main.show();
      this.footer.show();
      this.footer.html(this.statsTemplate({done: done, remaining: remaining}));
      this.allCheckbox.checked = !remaining;
    },

    forceSort: function(actor) {
      console.log('forceSorting?');
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

    // If you hit return in the main input field, create new **Actor** model,
    // persisting it to *localStorage*.
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;

      Actors.create({title: this.input.val()});
      this.input.val('');
    },

    // Clear all done actor items, destroying their models.
    clearCompleted: function() {
      _.invoke(Actors.done(), 'destroy');
      return false;
    }

  });

  _.templateSettings = { interpolate: /\<\@\=(.+?)\@\>/g, evaluate: /\<\@(.+?)\@\>/g };
  var App = new AppView;

});

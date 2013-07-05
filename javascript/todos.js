// An example Backbone application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses a simple
// [LocalStorage adapter](backbone-localstorage.html)
// to persist Backbone models within your browser.

// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  // Todo Model
  // ----------

  // Our basic **Todo** model has `title`, `order`, and `done` attributes.
  var Todo = Backbone.Model.extend({

    defaults: function() {
      return {
        title: "empty todo...",
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

    // Toggle the `done` state of this todo item.
    toggle: function() {
      this.save({done: !this.get("done")});
    }

  });

  // Todo Collection
  // ---------------

  // The collection of todos is backed by *localStorage* instead of a remote
  // server.
  var TodoList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: Todo,

    // Save all of the todo items under the `"todos-backbone"` namespace.
    localStorage: new Backbone.LocalStorage("todos-backbone"),

    // Filter down the list of all todo items that are finished.
    done: function() {
      return this.where({done: true});
    },

    // Filter down the list to only todo items that are still not finished.
    remaining: function() {
      return this.without.apply(this, this.done());
    },

    comparator: 'title',

    setActive: function(todo){
      this.where({active: true}).forEach(function(previous) {
        previous.save({active: false});
      });
      todo.save({active: true});
    }

  });

  // Create our global collection of **Todos**.
  var Todos = new TodoList;
  foo = Todos;

  // Todo Item View
  // --------------

  // The DOM element for a todo item...
  var TodoView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    attributes : {
      'class' : 'actor-item'
    },

    // Cache the template function for a single item.
    template: _.template($('#item-template').html()),

    // The DOM events specific to an item.
    events: {
      "click .toggle"   : "toggleDone",
      "dblclick .actor"  : "edit",
      "click a.destroy" : "clear",
      "click a.activate" : "activate",
      "keypress .edit"  : "updateOnEnter",
      "blur .edit"      : "close"
    },

    // The TodoView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Todo** and a **TodoView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    // Re-render the titles of the todo item.
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass('done', this.model.get('done'));
      this.$el.toggleClass('active', this.model.get('active'));
      this.input = this.$('.edit');
      return this;
    },

    activate: function() {
      Todos.setActive(this.model);
    },

    // Toggle the `"done"` state of the model.
    toggleDone: function() {
      this.model.toggle();
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      this.$el.addClass("editing");
      this.input.focus();
    },

    // Close the `"editing"` mode, saving changes to the todo.
    close: function() {
      var value = this.input.val();
      if (!value) {
        this.clear();
      } else {
        this.model.save({title: value});
        this.$el.removeClass("editing");
      }
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.destroy();
    }

  });

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#todoapp"),

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template($('#stats-template').html()),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #new-todo":  "createOnEnter",
      "click #clear-completed": "clearCompleted",
      "click #toggle-all": "toggleAllComplete",
      "click #activate-next": "activateNext"
    },

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *localStorage*.
    initialize: function() {

      this.input = this.$("#new-todo");
      this.allCheckbox = this.$("#toggle-all")[0];

      // this.listenTo(Todos, 'all', this.render);
      this.listenTo(Todos, 'add', this.addAll);
      this.listenTo(Todos, 'reset', this.addAll);
      this.listenTo(Todos, 'change:title', this.forceSort);
      this.listenTo(Todos, 'sort', this.reset);

      this.footer = this.$('footer');
      this.main = $('#main');
      this.orderList = $("#todo-list");

      Todos.fetch();
    },

    reset: function(){
      console.log('reset!');
      this.addAll();
    },

    render: function() {
      console.log('render!');
      var done = Todos.done().length;
      var remaining = Todos.remaining().length;

      this.main.show();
      this.footer.show();
      this.footer.html(this.statsTemplate({done: done, remaining: remaining}));
      this.allCheckbox.checked = !remaining;
    },

    forceSort: function(todo) {
      console.log('forceSorting?');
      Todos.sort();
    },

    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(todo) {
      var view = new TodoView({model: todo});
      this.orderList.append(view.render().el);
    },

    // Add all items in the **Todos** collection at once.
    addAll: function() {
      this.orderList.empty();
      Todos.each(this.addOne, this);
    },

    activateNext: function() {
      current_index = Todos.indexOf(Todos.where({active:true})[0]) || 0;
      candidate_index  = current_index + 1;
      target_index = candidate_index == Todos.length ? 0 : candidate_index;
      Todos.setActive(Todos.at(target_index));
    },

    // If you hit return in the main input field, create new **Todo** model,
    // persisting it to *localStorage*.
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;

      Todos.create({title: this.input.val()});
      this.input.val('');
    },

    // Clear all done todo items, destroying their models.
    clearCompleted: function() {
      _.invoke(Todos.done(), 'destroy');
      return false;
    },

    toggleAllComplete: function () {
      var done = this.allCheckbox.checked;
      Todos.each(function (todo) { todo.save({'done': done}); });
    }

  });

  _.templateSettings = { interpolate: /\<\@\=(.+?)\@\>/g, evaluate: /\<\@(.+?)\@\>/g };
  var App = new AppView;

});

var Session = Backbone.Model.extend({

  defaults: function() {

    var d = Date().toLocaleString('en-US');

    return {
      title: "Ready Session 0",
      index: null,
      selected: true ,
      lastplayed: d,
      actors: [
        {
          title: "Ready Player 1",
          order: 0,
          active: false,
          selected: false,
          conditions: [],
          features: ['persistent']
        },
        {
          title: "Ready Player 2",
          order: 0,
          active: false,
          selected: false,
          conditions: [],
          features: ['persistent']
        }
      ],
      environments: null
    };
  }
});

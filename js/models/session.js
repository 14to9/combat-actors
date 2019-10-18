var Session = Backbone.Model.extend({

  defaults: function() {

    var d = Date().toLocaleString('en-US');

    return {
      title: "New Session",
      index: null,
      selected: true ,
      lastplayed: d,
      actors: [],
      env: {aspects:[]}
    };
  }
});

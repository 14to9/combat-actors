var ActorEnvironment = Backbone.Model.extend({

  // localStorage: new Backbone.LocalStorage("actors-environment-backbone"),
  save: function(update) {
    _.extend(this.attributes, update);
    this.trigger('change');
    return null;
  },

  defaults: function() {
    return {
      aspects: [],
    };
  },

  addAspect: function(a){
    var newAspects = _.union(this.get('aspects'), [a]);
    this.save({
      'aspects': newAspects
    });
  },

  removeAspect: function(a){
    var newAspects = _.reject(this.get('aspects'), function(existing_a){
      return existing_a === a;
    });
    this.save({
      'aspects': newAspects
    });
  },

  hasAspect: function(feature) {
    return (this.get('aspects').indexOf(feature) >= 0);
  },

  resetAllAspects: function() {
    this.save({'aspects':[]});
  },

  removeLastAspect: function() {
    var last = _.last(this.aspects);
    if (last) {
      this.removeAspect(last);
    }
  }

});

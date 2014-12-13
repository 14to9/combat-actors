var ActorEnvironment = Backbone.Model.extend({

  localStorage: new Backbone.LocalStorage("actors-environment-backbone"),

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
  }

});

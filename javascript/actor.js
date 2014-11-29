var Actor = Backbone.Model.extend({

  defaults: function() {
    return {
      title: "empty actor...",
      order: 0,
      active: false,
      selected: false,
      conditions: [],
      features: []
    };
  },

  addCondition: function(condition){
    var newConditions = _.union(this.get('conditions'), [condition]);
    this.save({
      'conditions': newConditions
    });
  },

  removeCondition: function(condition){
    var newConditions = _.reject(this.get('conditions'), function(existing_condition){
      return existing_condition === condition;
    });
    this.save({
      'conditions': newConditions
    });
  },

  addFeature: function(feature){
    var newFeatures = _.union(this.get('features'), [feature]);
    this.save({
      'features': newFeatures
    });
  },

  removeFeature: function(feature){
    var newFeatures = _.reject(this.get('features'), function(existingFeature){
      return existingFeature === feature;
    });
    this.save({
      'features': newFeatures
    });
  },

  removeAllConditions: function() {
    this.save({'conditions':[]});
  },

  rotateConditions: function() {
    var c = this.get('conditions') || [];
    c.push(c.shift());
    this.save({'conditions': c});
  },

  hasFeature: function(feature) {
    return (this.get('features').indexOf(feature) >= 0);
  },

  toggleFeature: function(feature) {
    if (this.hasFeature(feature)) {
      this.removeFeature(feature)
    } else {
      this.addFeature(feature);
    }
  }
});

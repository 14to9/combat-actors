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

  hasNoInitiative: function() {
	var order = this.get("order");
	if (order === '' || order == null) {
		return true;
	}
	else {
		return false;
	}
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
    var c = _.clone(this.get('conditions') || []);
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
  },

  rotateFeature: function(featureList) {
    var matcher = function (feature) {
      return _.contains(featureList, feature);
    };
    var currentSelection = _.find( this.get('features')
                                 , matcher );
    if (currentSelection) {
      this.removeFeature(currentSelection);
      var idx = featureList.indexOf(currentSelection);
      var next = idx + 1;
      if (next == featureList.length) next = 0;
      this.addFeature(featureList[next]);
    } else {
      this.addFeature(featureList[0]);
    }
  },

  removeTransientFeatures: function() {
    var newFeatures = _.reject(this.get('features'), function(f) {
      return (f != 'persistent');
    });
    this.save({
      'features': newFeatures
    });
  },

  incrementCondition: function(condition, delta) {
    var condition = _.find(this.get('conditions'), function(c){
      return c === condition;
    });
    if (condition) {
      // test for integer
      var p = new RegExp("[0-9]+$");
      var val = p.exec(condition);
      if (val[0]) {
        this.removeCondition(condition);
        var newVal = parseInt(val[0]) + delta;
        if (newVal <= 0) newVal = 0;
        var prefixLen = condition.length - val[0].length;
        var prefix = condition.substring(0, prefixLen);
        var newCondition = prefix + newVal;
        this.addCondition(newCondition);
      }
    }
  }

});

var Actor = Backbone.Model.extend({

  save: function(update) {
      _.extend(this.attributes, update);
      this.trigger('change:order');
      this.trigger('change');
      return null;
  },

  defaults: function() {
    return {
      title: "empty actor...",
      order: 0,
      active: false,
      selected: false,
      conditions: [],
      features: ['available']
    };
  },

  hasNoInitiative: function() {
    var order = this.get("order");
    if (order === '' || order == null) {
      return true;
    } else {
      return false;
    }
  },

  addCondition: function(condition){
    if (condition) {
      var newConditions = _.union(this.get('conditions'), [condition]);
      var withoutDups   = _.uniq(newConditions, function(i, k, a) { return i.title; });
      this.save({
        'conditions': withoutDups
      });
    }
  },

  removeCondition: function(condition){
    if (condition) {
      var newConditions = _.reject(this.get('conditions'), function(existing_condition){
        return existing_condition.title === condition.title;
      });
      this.save({
        'conditions': newConditions
      });
    }
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
    // this.save({'conditions':[]});

    var newConditions = _.reject(this.get('conditions'), function(existing_condition){
      return existing_condition.persistent === false;
    });

    this.save({
      'conditions': newConditions
    });


  },

  rotateConditions: function() {
    var c = _.clone(this.get('conditions') || []);
    if(c.length > 0){
        console.log('rotateConditions', c);
        c.push(c.shift());
        this.save({'conditions': c});
    }
  },

  hasFeature: function(feature) {
    return (this.get('features').indexOf(feature) >= 0);
  },

  toggleFeature: function(feature) {
    if (this.hasFeature(feature)) {
      this.removeFeature(feature);
    } else {
      this.addFeature(feature);
    }
  },

  rotateFeature: function(featureList) {
    var matcher = function (feature) {
      return _.contains(featureList, feature);
    };
    var currentSelection = _.find( this.get('features'), matcher );

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

  incrementCondition: function(condition, delta=1) {
    // Function removes condition entirely if decremented to '0' or less

    var verify_condition = _.find(this.get('conditions'), function(c){
        return c.title === condition.title;
    });

    if (verify_condition) {
      // test for integer
      var p = new RegExp("[0-9]+$");
      var val = p.exec(condition.title);
      if (val && val[0]) {
        this.removeCondition(condition);
        var newVal = parseInt(val[0]) + delta;
        if (newVal <= 0) {
          this.removeCondition(condition);
        } else {
          var prefixLen = condition.title.length - val[0].length;
          var prefix = condition.title.substring(0, prefixLen);
          var newCondition = prefix + newVal;
          this.addCondition({title:newCondition, persistent: condition.persistent});
        }
      }
    }
  },

  findConditionLike: function(titleMatch) {
    return _.find(this.get('conditions'), function(c){
        return c.title.includes(titleMatch);
    });

  },

  incrementMatched: function(partialTitle, offset) {
    var target = this.findConditionLike(partialTitle);
    if (target) { this.incrementCondition(target, offset) }
    else { this.addCondition(Condition.newCondition(partialTitle + " x1")); }
  },

  actorDown: function() {
    this.toggleFeature('dying');
    if (this.hasFeature('dying')) {
      this.addCondition(Condition.proneCondition());
      this.addCondition(Condition.incapacitatedCondition());
      this.addCondition(Condition.unconsciousCondition());
    }
  },

  cleanupDeath: function() {
    this.removeFeature('dying');
    this.removeFeature('unconscious');
    this.removeCondition(Condition.incapacitatedCondition());
    this.removeCondition(Condition.unconsciousCondition());
    this.removeCondition(this.findConditionLike('dying'));
    this.removeCondition(this.findConditionLike('stabilizing'));
  }

});

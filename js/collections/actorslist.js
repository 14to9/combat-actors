  var ActorList = Backbone.Collection.extend({

    model: Actor,

    // localStorage: new Backbone.LocalStorage("actors-backbone"),

    comparator: function(x){
      return - parseInt(x.get('order'));
    },

    setActive: function(actor){
      this.where({active: true}).forEach(function(previous) {
        previous.save({active: false});
      });
      actor.save({active: true});
      this.setSelected(actor);
    },

    setSelected: function(actor){
      if (actor != undefined) {
        this.where({selected: true}).forEach(function(previous) {
          previous.save({selected: false});
        });
        actor.save({selected: true});
      }
    },

    activeActor: function(){
      return this.where({active: true})[0] || 0;
    },

    nextActor: function(){
      candidate_index = this.nextActiveIndex();
      target_index = candidate_index == this.length ? 0 : candidate_index;
      return this.at(target_index);
    },

    activeIndex: function(){
      return this.indexOf(this.activeActor());
    },

    selectedActor: function(){
      return this.where({selected: true})[0] || 0;
    },

    selectedIndex: function() {
      return this.indexOf(this.selectedActor()) || 0;
    },

    nextActiveIndex: function() {
      return this.activeIndex() + 1;
    },

    nextSelectedIndex: function() {
      return this.selectedIndex() + 1;
    },

    downSelect: function() {
      candidate_index = this.nextSelectedIndex();
      target_index = candidate_index == this.length ? 0 : candidate_index;
      this.setSelected(this.at(target_index));
    },

    upSelect: function() {
      candidate_index  = this.selectedIndex() - 1;
      target_index = candidate_index < 0 ? this.length - 1 : candidate_index;
      this.setSelected(this.at(target_index));
    },

    activateNext: function() {
      candidate_index = this.nextActiveIndex();
      target_index = candidate_index == this.length ? 0 : candidate_index;
      this.setActive(this.at(target_index));
    },

    activatePrevious: function() {
      candidate_index  = this.activeIndex() - 1;
      target_index = candidate_index < 0 ? this.length - 1 : candidate_index;
      this.setActive(this.at(target_index));
    },

    isFocusedAway: function() {
      return (this.selectedActor() != this.activeActor());
    }

  });
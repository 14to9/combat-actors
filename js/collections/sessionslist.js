  var SessionList = Backbone.Collection.extend({

    model: Session,

    localStorage: new Backbone.LocalStorage("game-sessions"),

    initialize: function() {
        console.log('Initializing games sessions');
        this.fetch();

        if(this.length < 1) {
            console.log('sessionlist: No game sessions ... creating one');
            this.setSelected(this.create());
        } else {
            this.setSelected(this.selectedSession());
        }
    },

    saveActors: function(models) {
        var s = this.selectedSession();
        s.set('actors', models);
        s.save();
    },

    setTitle(title) {
      var session = this.selectedSession();
      if(session && title.length > 0) {
        return session.save({title});
      } else {
        return '';
      }
    },

    getTitle: function() {
        var session = this.selectedSession();
        if(session){
          return session.get('title');
        } else {
          return '';
        }
    },

    getActors: function() {
        return this.selectedSession().get('actors');
    },

    setSelected: function(session) {
        if (session != undefined) {
            this.where({selected: true}).forEach(function(previous) {
              previous.save({selected: false});
            });
            session.save({selected: true});
        }
    },

    newSession: function() {
        this.setSelected(this.create({'title':'Ready New Session ' + this.length }));
    },

    removeSession: function() {
        var s = this.selectedSession();
        this.upSelect();
        s.destroy();
    },

    selectedSession: function(){
      if(this.where({selected: true})[0]) {
        return this.where({selected: true})[0];
      } else {
        console.log('missing selectedSession');
      }
    },

    selectedIndex: function() {
      return this.indexOf(this.selectedSession()) || 0;
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
    }

  });

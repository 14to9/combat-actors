var Condition = {
    newCondition: function(title) {
    return {title:title, persistent: false};
  },

  proneCondition: function() {
    return this.newCondition("prone");
  },

  incapacitatedCondition: function() {
    return this.newCondition("incapacitated");
  },

  unconsciousCondition: function() {
    return this.newCondition("unconscious");
  },

  fifthEditionConditions: [
      "blinded"
    , "charmed"
    , "deafened"
    , "exhaustion"
    , "frightened"
    , "grappled"
    , "incapacitated"
    , "invisible"
    , "paralyzed"
    , "petrified"
    , "poisoned"
    , "prone"
    , "restrained"
    , "stunned"
    , "unconscious"
  ]
  
}
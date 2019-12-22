class UnitRL {
    constructor(player, unitTypeRL) {
        this.player = player
        var unitFetched = unitListRL.get(unitTypeRL)
        this.name = unitFetched.name
        this.hp = this.maxHp = unitFetched.hp
        this.stamina = this.maxStamina = unitFetched.stamina
        this.tileImg = unitFetched.tileImg
        //tracks stamina used during turn
        this.staminaUsed = 0
        this.skills = FetchSkillsRL(unitFetched.skills)

        this.movement = 0
        this.dodge = 0

        this.x = undefined
        this.y = undefined
    }

    ChangeMovement(amt){
        this.movement += amt
    }

    ChangeDodge(amt){
        this.dodge += amt
    }

    EndTurn(){
        //check if dead
        if(this.hp <= 0){
            //dead
        }

        this.stamina = Math.max(4 - this.staminaUsed, 0)
        this.staminaUsed = 0

        this.movement = 0
        this.dodge = 0
    }
}

let unitListRL = new Map()


function StartResourceLoading(){
    // console.log("fetching")
    fetch("../json/unitListRL.json")
    .then(response => response.json())
    .then(json => {
        for(var test in json){
            // console.log( json[test].name)
            unitListRL.set(json[test].name, json[test])
        }
        //StartResourceLoadingArmy()
    });
}
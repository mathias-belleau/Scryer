const SkillRlSpeedEnum = Object.freeze({
    INSTANT: 'INSTANT',
    SLOW: 'SLOW',
    FAST: 'FAST'
})

const matchType = Object.freeze({
    SINGLE: {dieAmt:1, check: function(dice){return true} },
    DOUBLE: {dieAmt:2, check: function(dice){return testing[0] == testing[1]} },
    TRIPLE: {dieAmt:3, check: function(dice){return testing[0] == testing[1] == testing[2]} },
    QUAD: {dieAmt:4, check: function(dice){return testing[0] == testing[1] == testing[2] == testing[3]} },
    STRAIGHT3: {dieAmt:3, check: function(dice){return testing[0] == testing[1] -1 == testing[2] -2} },
    STRAIGHT4: {dieAmt:4, check: function(dice){return testing[0] == testing[1] -1 == testing[2] -2 == testing[3] -3} },
    STRAIGHT5: {dieAmt:5, check: function(dice){return testing[0] == testing[1] -1 == testing[2] -2 == testing[3] -3 == testing[4] -4} },
    STRAIGHT6: {dieAmt:6, check: function(dice){return testing[0] == testing[1] -1 == testing[2] -2 == testing[3] -3 == testing[4] -4 == testing[5] -5} }
})

class SkillRL{
    constructor(name, description, costType, costMatch, speed){
        this.name = name;
        this.description = description;
        this.costType = costType;
        this.costMatch = costMatch
        this.speed = speed
    } 

    //actually use the skill
    Cast(caster){

        //returns if cast succesfully so the stamina can be exhausted
        return true
    }


    CanUse(selectedDice){
        //need to check if we can cast this spell
        //first sort the dice
        //then check depending on the costType + costMatch
        selectedDice.sort((a, b) => a - b)
        return this.Matches(selectedDice)
    }

    //check if the selecte die match the requirements of this skill
    Matches(selectedDice){
        //compare if it the right number of selected dice
        if(selectedDice.length != matchType[this.costType].dieAmt ){
            return false
        }

        //check if this skill has specific number requirments to use
        //0 is *
        //ex: costMatch = [1,2] would require all die used to be either 1 or 2
        if(costMatch == 0){
            return matchType[this.costType].check(selectedDice)
        }else {
            //check each die to make sure it matches required numbers
            for(var x = 0; x < selectedDice.length; x++){
                if( !this.costMatch.includes(selectedDice[x]) ){
                    return false
                }
            }
            //make sure it follows the type rules
            return matchType[this.costType].check(selectedDice)
        }
    }

}
//#region move
class Move extends SkillRL{
    constructor(name, description, costType, costMatch, speed){
        super("Move", "used for moving", "SINGLE", 0, SkillRlSpeedEnum.INSTANT)
    }

    Cast(caster){
        caster.ChangeMovement(1)

        return true
    }
}
const MoveSkillRL = new Move()
//#endregion


function FetchSkillsRL(skills) {
    var skillList = []
    return skillList
}
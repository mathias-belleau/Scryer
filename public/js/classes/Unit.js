class Unit {
    constructor(player, unitType) {
        var unitFetched = unitList.get(unitType)
        console.log("fetched unit: ", unitFetched)

        this.player = player
        //fetch unit type from list
        
        this.hp = this.maxHp = unitFetched.maxHP
        this.attacked = false
        this.ranged = false
        this.tileImg = unitFetched.tileImg

        this.x = undefined
        this.y = undefined

        this.speed = 0
        
    }

    //for ROT scheduler
    getSpeed(){
        return this.speed
    }

    TakeDamage(amount){
        this.hp -= amount

        if(this.hp <= 0){
            //trigger death stuff
            this.x = undefined
            this.y = undefined
        }
    }

    TakeTurn(mapData, units){
        //decide what to do
        //if ranged simply fire at a random enemy

        //get location of all enemies
        //if distance to an enemy is 1? attack it
        //else attempt move towards closest enemy
        //^ if fail attempt move to second closest

        //make new pathfinder
        console.log("here1")
        var dijkstra = new ROT.Path.AStar(this.x, this.y, passableCallback(mapData, this.x, this.y));
        console.log("here2")
        var paths = []
        console.log(units)
        
        units.forEach( function (unit) {
            var pathCallback = function(x, y) {
                console.log('pls')
                paths.push([x, y]);
            }

            console.log("here2.5", unit)
            if(this != unit || this.player != unit.player){
                    console.log("here2.6")
                    const x = unit.x
                    const y = unit.y
                    
                    dijkstra.compute(unit.x, unit.y, pathCallback);

            }else{
                console.log("butts")
            }
            console.log("??")
        }.bind(this));
        console.log("here3")
        //reverse the path
        paths = paths.reverse()
        console.log("here4")
        console.log(paths)
    }
}

var testCall = (x, y) => {
    console.log("blahh")
}
/* input callback informs about map structure */
var passableCallback = function(mapData, x, y) {
    console.log("here")
    //check if wall
    if(mapData[x][y].tileType == 'a'){
        return false
    }
    //check if has unit existing
    if(mapData[x][y].unit != undefined){
        return false
    }
    //return true
    return true
}

let unitList = new Map()

function StartResourceLoading(){
    console.log("fetching")
    fetch("../json/unitList.json")
    .then(response => response.json())
    .then(json => {
        for(var test in json){
            console.log( typeof json[test].name)
            unitList.set(json[test].name, json[test])
        }
        console.log("starting game")
        StartGame()
    });
}




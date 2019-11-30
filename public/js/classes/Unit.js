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
        var x = this.x
        var y = this.y
        var passableCallback = function(x, y) {
            //check if wall
            if(game.mapData[x][y].tileType == 'a'){
                return false
            }
            //check if has unit existing
            if(game.mapData[x][y].unit != undefined){
                return false
            }
            return true
        }
        var astar = new ROT.Path.AStar(x, y, passableCallback);
        console.log(astar)

       console.log("this unit is: ", this.tileImg)
        for(var number = 0; number < units.length; number++){
            var paths = []
            
            var unit = units[number]
            
            console.log("unit about to do", unit.tileImg)
            if(this != unit || this.player != unit.player){
                    console.log("need to calc path from:", this.tileImg, " to ", unit.tileImg)
                    var xx = unit.x
                    var yy = unit.y
                    console.log("xx:",xx,"  yy:",yy)
                    
                    var pathCallback = function(x, y) {
                        console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:")
                        paths.push([x, y]);
                    }     
                   
                    astar.compute(2, 2, pathCallback);

                    

            }else{
                console.log("don't compute as we match ourselves")
            }
            console.log(paths)
            console.log("finished finding paths")
        }
        console.log("outside finding all paths")
        //reverse the path
        // paths = paths.reverse()
        // console.log(paths)
    }
}




/* input callback informs about map structure */


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




class Player {
    constructor(name, side){
        this.name = name
        this.unitList = []

        //left:0, right: 1
        this.side = side
        this.unitCount = {
            infantry: 0,
            ranged:0,
            leaderMagic:0
        }
    }

    AddUnit(unitName){
        this.unitList.push(unitName)
    }

    SortRankFile(){
        //upon receiving unit decide where to place on map
        // 0 0 0 0 0 0 0 0 0 0 
        // 0 4 9 4 0 0 4 0 0 0
        // 0 2 7 2 0 0 2 0 0 0
        // 0 1 6 1 0 0 1 0 0 0
        // 0 3 8 3 0 0 3 0 0 0
        // 0 5 0 5 0 0 5 0 0 0
        // 0 0 0 0 0 0 0 0 0 0

        this.unitCount.infantry = this.unitList.filter( unit => unit.ranged == false && unit.leader == false && this.magic == false)
        this.unitCount.ranged = this.unitList.filter( unit => unit.ranged == true && unit.leader == false && this.magic == false)
        this.unitCount.leader = this.unitList.filter( unit.leader == true || this.magic == true)

        //game height width hardcoded here. prolly bad
        // how tall our unit lines can be
        var heightCap = game.height - 4
        

        //how far out we can play units. this is inverse for right side player
        var widthCap = (game.width - 4) / 2

        var maxUnitNum = heightCap * widthCap
        if(this.unitCount.infantry + this.unitCount.ranged + this.unitCount.leaderMagic > maxUnitNum ){
            console.log("BIG OL ERROR TOO MANY UNITS")
            return
        }
        var InfantrySpawnOrder = GenerateInfantrySpawnOrder(side, heightCap, widthCap, this.unitCount.infantry)
        for(var x = 0; x < this.unitCount.infantry; x++){
            //for each unit in infantry get it's position it should be at 
            console.log()
            this.unitList[x].x = InfantrySpawnOrder[x].x
            this.unitList[x].y = InfantrySpawnOrder[x].y
        }
       
    }
}

function GenerateInfantrySpawnOrder(side, heightCap, widthCap, count){
    var heightMod = [0, 1, -1, 2, -2, 3, -3, 4, -4]
    
    for(var y = 1; y < heightMod; y++){
        heightMod.append(y)
        heightMod.append(y*-1)
    }

    for(var y = 1; y < heightMod; y++){
        heightMod.append(y)
        heightMod.append(y*-1)
    }
    
    //for side 0 start at max width and go down
    //for side 1 start at minimum width position and go up
    var placementList = []
    
    var startX = 0
    var startY = 0
    //where to start spawning the first unit
    if(side == 0){
        startX = widthCap
    }else {
        startX = game.width - widthCap
    }
    startY = (heightCap / 2) + .5

    if(side == 0){
        for(var x = 0; x < count; x++){
            placementList.append( {x:startX - (placementList.length % heightCap == 0), y: startY + heightMod[x]} )
        }
    } else {
        for(var x = 0; x < count; x++){
            placementList.append( {x:startX + (placementList.length % heightCap == 0), y: startY + heightMod[x]} )
        }
    }
    return placementList
}
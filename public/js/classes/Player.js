class Player {
    constructor(name, side){
        this.name = name
        this.unitList = []

        //left:0, right: 1
        this.side = side
    }

    AddUnit(unitName){
        this.unitList.push(unitName)
    }
}
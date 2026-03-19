function aStar(start, goal, grid){
  const open = []
  const closed = []
  open.push(start)

  while(open.length){
    const current = open.pop()
    if(current == goal)
       return reconstructPath()
    for(const n of neighbors(current)){
        if(grid[n] == "blocked")
           continue
        open.push(n)
    }
  }
}

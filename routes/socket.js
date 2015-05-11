module.exports = function(io) {
  io.sockets.on('connection', function(socket) {
    socket.on('connect-to', function(data) {
      var boardRoom = data.boardId;
      var sprintRoom = data.boardId + '/' + data.sprintId;

      if(socket.lastBoardRoom && socket.lastBoardRoom != boardRoom) {
        socket.leave(socket.lastBoardRoom);
      }

      if(socket.lastSprintRoom && socket.lastSprintRoom != sprintRoom) {
        socket.leave(socket.lastSprintRoom);
      }

      if(socket.lastBoardRoom != boardRoom) {
        socket.lastBoardRoom = boardRoom;
        socket.join(boardRoom);
      }

      if(socket.lastSprintRoom != sprintRoom) {
        socket.lastSprintRoom = sprintRoom;
        socket.join(sprintRoom);
      }
    });
  });
}
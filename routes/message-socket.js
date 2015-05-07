module.exports = function(io) {
  io.sockets.on('connection', function(socket) {
    socket.on('connect-to', function(data) {
      var boardRoom = data.boardId;
      var sprintRoom = data.boardId + '/' + data.sprintId;

      if(socket.lastBoardRoom) {
        socket.leave(socket.lastRoom);
      }

      if(socket.lastSprintRoom) {
        socket.leave(socket.lastSprintRoom);
      }

      socket.lastBoardRoom = boardRoom;
      socket.lastSprintRoom = sprintRoom;
      socket.join(boardRoom);
      socket.join(sprintRoom);
    });
  });
}
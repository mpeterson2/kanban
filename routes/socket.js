module.exports = function(io) {
  io.sockets.on('connection', function(socket) {
    socket.on('connect-to', function(data) {
      var boardRoom = data.boardId;
      var sprintRoom = data.boardId + '/' + data.sprintId;

      if(socket.lastBoardRoom && socket.lastBoardRoom != data.boardId) {
        socket.leave(socket.lastBoardRoom);
      }

      if(socket.lastSprintRoom && socket.lastSprintRoom != data.sprintId) {
        socket.leave(socket.lastSprintRoom);
      }

      if(socket.lastBoardRoom != data.boardId) {
        socket.lastBoardRoom = boardRoom;
        socket.join(boardRoom);
      }

      if(socket.lastSprintRoom != data.sprintId) {
        socket.lastSprintRoom = sprintRoom;
        socket.join(sprintRoom);
      }
    });
  });
}
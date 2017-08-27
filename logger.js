module.exports = function(request, reponse, next) {
  var start = +new Date();
  var stream = process.stdout;
  var url = request.url;
  var method = request.method;

  reponse.on('finish', function() {
    var duration = +new Date() - start;
    var message = method + ' to ' + url + '\ntook ' + duration + ' ms \n\n';
    stream.write(message);
  });
  next();
};

(function(){
var t = new Date();

/** Show a timer in the console between two calls
* @param {bool | string} msg Message to log / true to start timer
*/
window.timer = function(msg)
{	if (msg !== true) console.log ((new Date() - t) +" : "+ (msg||"timer"));
	t = new Date();
};
})();
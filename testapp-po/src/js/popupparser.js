module.exports = function(input) {
    console.log(input);
    return function(data) {
        data.elm.innerHTML = 'sklep';
    };
    
}
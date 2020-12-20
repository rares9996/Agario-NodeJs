function BlobEvent(blob) {
    this.blob = blob;
    this.observers = [];
    
}

BlobDecorator.prototype = {
 
    subscribe: function(fn) {
        this.observers.push(fn);
    },
 
    unsubscribe: function(observer) {
        this.observers.splice(this.observers.indexOf(observer),1);

    },
 
    notify: function(entity, event) {
        this.observers.forEach(observer => observer(entity, event));
    }
}
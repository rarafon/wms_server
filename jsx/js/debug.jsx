const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMSET = "0123456789";
const CHARNUMSET = CHARSET + NUMSET;

class DebugApp extends React.Component {
  getRandomWordsInts(length) {
    let s = ""
    for(let  i=0; i< length; i++) {
      s += CHARNUMSET.charAt(Math.floor(Math.random() * CHARNUMSET.length));
    }
    return s;
  }
  getRandomLetters(length) {
    let s = ""
    for(let  i=0; i< length; i++) {
      s += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
    }
    return s;
  }
  getRandomInt(length) {
    let s = ""
    for(let  i=0; i< length; i++) {
      s += NUMSET.charAt(Math.floor(Math.random() * NUMSET.length));
    }
    return parseInt(s);
  }
  showSuccess = () => {
    window.alert("done");
  }

  createWarehouseLocations = () => {
    this.createDummyWarehouses((warehouse) => {
      console.log("w", warehouse);
      this.createDummyLocations(warehouse.id);
    });
  }
  createDummyWarehouses = (callback) => {
    let data = {
      name: this.getRandomLetters(10),
      description: this.getRandomLetters(10),
      address1: this.getRandomLetters(10),
      address2: this.getRandomLetters(10),
      city: this.getRandomLetters(6),
      state: this.getRandomLetters(2),
      zip: String(this.getRandomInt(6)),
      phone: String(this.getRandomInt(9)),
      code: this.getRandomWordsInts(3),
    };
    $.ajax({
      url: "./warehouses",
      type: "POST",
      // context: this,
      contentType: "application/json;",
      data: JSON.stringify(data),
      context: this,
      success: function(warehouse) {
        if (callback) {
          console.log(callback);
          callback(warehouse);
        }
      },
    });
  };
  createDummyLocations(warehouseId) {
    let data = {
      area: this.getRandomLetters(2),
      row_start: 1,
      row_end: 2,
      bay_start: 1,
      bay_end: 2,
      level_start: 1,
      level_end: 1,
      shelf_start: 1,
      shelf_end: 1,
    };
    $.ajax({
      type: "POST",
      url: "./warehouses/" + warehouseId + "/locations",
      contentType: "application/json",
      context: this,
      data: JSON.stringify(data),
      success: function(new_locations) {
        this.showSuccess();
      },
    });
  }

  viewLocations = () => {
    $.ajax({
      type: "GET",
      url: "/locations",
      success: function(data) {
        console.log(data);
      }
    });
  }

  createDummyItemInfos = () => {
    let total = 5;
    for (let i=1; i<=total; i++) {
      setTimeout(()=>{
        let data = {
          description: this.getRandomLetters(10),
          height: this.getRandomInt(1),
          length: this.getRandomInt(1),
          width: this.getRandomInt(1),
          weight: this.getRandomInt(2),
          itemSku: this.getRandomWordsInts(5),
          name: this.getRandomLetters(6),
        };
        const count = i;
        $.ajax({
          url: "/iteminfo",
          type: "POST",
          data: data,
          success: function() {
            if (count == total) {
              window.alert("done");
            }
          }
        });
      }, i*200);
    }
  }

  createDummyItemReceive = () => {
    $.ajax({
      url: "/iteminfo",
      type: "GET",
      context: this,
      success: function(iteminfos) {
        let total = 5;
        for (let i=1; i<=total; i++) {
          setTimeout(()=>{
            // Continue finding itemInfo until it has an SKU
            let index;
            let itemSku;
            for (let j=0; j<20; j++) {
              index = Math.floor(Math.random() * iteminfos.length);
              if (!iteminfos[index].itemskus || 
                  iteminfos[index].itemskus.length == 0) {
                continue;
              } else {
                itemSku = iteminfos[index].itemskus[0].sku;
                break;
              }
            }
            if (itemSku == null) {
              window.alert("Need items with sku created");
              return;
            }
            // console.log(iteminfos[index]);
            let data = {
              shipmentCode: this.getRandomLetters(4),
              quantity: this.getRandomInt(3),
              itemSku: itemSku,
            };
            const count = i;
            $.ajax({
              url: "/itemreceive",
              type: "POST",
              data: data,
              success: function() {
                if (count == total) {
                  window.alert("done");
                }
              }
            });
          }, i*200);
        }
      }
    });
  };

  createDummyItemInventory = () => {
    $.ajax({
      type: "GET",
      url: "/locations",
      success: function(locations) {
        if (locations.length == 0) {
          window.alert("There are you locations");
          return;
        }
        const locationCode = locations[
          Math.floor(Math.random() * locations.length)
        ].locationCode;

        $.ajax({
          url: "/itemreceive",
          type: "GET",
          context: this,
          success: function(itemreceives) {
            if (itemreceives.length == 0) {
              window.alert("There are no itemReceives");
              return;
            }
            let itemReceive, index;
            // Continue finding itemReceive until quantity > 0
            for (let i=0; i< 20; i++) {
              index = Math.floor(Math.random() * itemreceives.length);
              itemReceive = itemreceives[index];
              if (itemReceive.quantity > 0)
                break;
            }
            if (itemReceive.quantity == 0) {
              window.alert("Create an item receive with quantity > 0");
              return;
            }
            
            let data = {
              locationCode: locationCode,
              quantity: Math.floor(Math.random() * itemReceive.quantity) + 1,
              itemReceiveId: itemReceive.id,
            };
            $.ajax({
              url: "/iteminventory",
              type: "POST",
              data: data,
              success: function() {
                window.alert("done");
              }
            });
          }
        });
      }
    });
  };

  createDummyItemOrder = () => {
    $.ajax({
      url: "/iteminventory",
      type: "GET",
      context: this,
      success: function(items) {
        console.log(items);
        // Random # of items to select
        const num = Math.floor(Math.random() * items.length)+1;
        const idSet = new Set();
        let count = 0, index;
        let ids = [],
            quantities = [];
        while (count < num) {
          index = Math.floor(Math.random() * items.length);
          if (!idSet.has(items[index].id)) {
            if (items[index].quantity <= 0) {
              continue;
            }
            count++;
            ids.push(items[index].id);
            quantities.push(
              Math.min(
                Math.floor(Math.random() * items[index].quantity) + 1,
                items[index].quantity
              ));
            idSet.add(items[index].id);
          }
        }
        const data = {
          itemIds: ids,
          quantities: quantities,
          orderName: this.getRandomLetters(5),
          description: this.getRandomLetters(10),
          contactName: this.getRandomLetters(8),
          companyName: this.getRandomLetters(8),
          address1: this.getRandomLetters(10),
          address2: this.getRandomLetters(5),
          city: this.getRandomLetters(5),
          email: this.getRandomLetters(5),
          state: this.getRandomLetters(2),
          zip: this.getRandomInt(5),
          phone: this.getRandomInt(9),
          transportName: this.getRandomLetters(8),
        };
        console.log(data);
        $.ajax({
          url: "/orderpackages",
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(data),
          success: function(order) {
            console.log(order)
            window.alert("done");
          }
        });
      }
    });
  };

  pickupOrder = () => {
    $.ajax({
      url: "/orderpackages?type=open",
      type: "GET",
      context: this,
      success: function(orders) {
        console.log(orders);
      }
    });
  };

  render() {
    return (
    <div>
      <div>
        <p>
          <button type="button" onClick={this.createWarehouseLocations}
            className="btn btm- btn-outline-primary">Create Warehouse + Locations</button>
          </p>
        <p>
          <button type="button" onClick={this.viewLocations}
            className="btn btn-outline-primary" >View Locations</button>
        </p>
        <p>
          <button type="button" onClick={this.createDummyItemInfos}
          className="btn btn-outline-primary">Create 5 ItemInfos</button>
        </p>      
        <p>
          <button type="button" onClick={this.createDummyItemReceive}
            className="btn btn-outline-primary">Create 5 ItemReceives</button>
        </p>
        <p>
          <button type="button" onClick={this.createDummyItemInventory}
            className="btn btn-outline-primary">Create Item Inventory</button>
        </p>
        <p>
          <button type="button" onClick={this.createDummyItemOrder}
            className="btn btn-outline-primary">Create Order</button>
        </p>
        <p>
          <button type="button" onClick={this.pickupOrder}
            className="btn btn-outline-primary">Pickup Order (Not Working)</button>
        </p>
      </div>
    </div>);
  }
}

(function loadReact() {
  ReactDOM.render((<DebugApp />), document.getElementById("content-container"));
})();
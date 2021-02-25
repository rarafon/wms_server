// import { ModalMenu } from "../etc/modalmenu/ModalMenu.js"
import { OrderMenu } from "../etc/modalmenu/OrderMenu.js"

class ShipOrderApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: "orders", // "orders, shipment"
      openOrders: [],
      clearQuantity: false,
      selectedOrderIndex: -1,
    };
    this.loadOpenOrders();

    this.itemCheckFormId = "item-check-form";
    this.skuInputId = "itemsku-input";
    this.quantityInputId = "quantity-input";

    this.modalmenu = React.createRef();
  }

  convertOrderItems = (order) => {
    const itemIndexMap = {};
    const itemsList = [];
    let itemSku, index;
    order.itemOrderResponses.forEach(itemResponse => {
      itemSku = itemResponse.itemInventoryResponse.itemSku;
      if (itemSku in itemIndexMap) {
        index = itemIndexMap[itemSku];
        itemsList[index].orderedQuantity += itemResponse.orderedQuantity;
        itemsList[index].startQuantity += itemResponse.startQuantity;
        itemsList[index].completeQuantity += itemResponse.completeQuantity;
        itemsList[index].pickedQuantity += itemResponse.pickedQuantity;
      } else {
        itemIndexMap[itemSku] = itemsList.length;
        itemsList.push({
          itemName: itemResponse.itemInventoryResponse.itemName,
          itemSku: itemResponse.itemInventoryResponse.itemSku,
          orderedQuantity: itemResponse.orderedQuantity,
          startQuantity: itemResponse.startQuantity,
          pickedQuantity: itemResponse.pickedQuantity,
          completeQuantity: itemResponse.completeQuantity,
          description: itemResponse.itemInventoryResponse.itemDescription,
        });
      }
    });
    return itemsList;
  };

  itemFormReset = () => {
    $("#" + this.itemCheckFormId)[0].reset();
    $("#" + this.skuInputId)[0].focus();
  };

  selectItem = (e) => {
    e.preventDefault();
    const sku = e.target.textContent;
    this.itemFormReset();
    $("#" + this.skuInputId).val(sku);
    $("#" + this.quantityInputId)[0].focus();
  };

  createPickupItemsTable = () => {
    let tbody;
    if (this.state.selectedOrderIndex == -1) {
      tbody = (<tbody></tbody>);
    } else {
      const items = this.state.openOrders[this.state.selectedOrderIndex].itemsList;
      tbody = (<tbody>
        {items.map((itemOrder, index) => {
          const orderedQuantityClass = (itemOrder.orderedQuantity > 0) ?
            "warn-order" : "done-order";
          const pickedRemaining = itemOrder.pickedQuantity - itemOrder.shippingQuantity > 0;
          return (
            // IDs don't exist since the items are combined by location & sku
            <tr key={"pickup-items-" + index}>
              <td>{itemOrder.itemName}</td>
              <td>
                {pickedRemaining ?
                (<a href="" onClick={this.selectItem}>{itemOrder.itemSku}</a>) : 
                itemOrder.itemSku
                }
                </td>
              <td className={orderedQuantityClass}>
                {itemOrder.orderedQuantity}
              </td>
              <td className={pickedRemaining ? "warn-order" : "done-order"}>
                {itemOrder.pickedQuantity}
              </td>
              <td>{itemOrder.shippingQuantity}</td>
              <td>{itemOrder.completeQuantity}</td>
              <td>{itemOrder.startQuantity}</td>
              <td>{itemOrder.description}</td>
            </tr>
          );
        })}
      </tbody>);
    }
    return (
    <table className="table table-sm">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">SKU</th>
          <th scope="col">Unpicked</th>
          <th scope="col">Picked</th>
          <th scope="col">Shipping</th>
          <th scope="col">Completed</th>
          <th scope="col">Total Quantity</th>
          <th scope="col">Description</th>
        </tr>
      </thead>
      {tbody}
    </table>)
  };

  loadOpenOrders = () => {
    $.ajax({
      url: "/orderpackages?type=open",
      type: "GET",
      context: this,
      success: function(orders) {
        console.log(orders);
        for(let i=0; i< orders.length; i++) {
          orders[i].itemsList = this.convertOrderItems(orders[i]);
        }
        this.setState({
          openOrders: orders,
          selectedOrderIndex: -1,
        });
      }
    })
  };

  onChangeClearQuantity = (e) => {
    this.setState(state => {
      return {
        clearQuantity: !state.clearQuantity
      };
    });
  }

  // Group up items by locationCode & itemSku and put combined items
  // into state.selectedItems;
  onClick_selectOrder = (e) => {
    this.setState(state =>{
      const selectedIndex = parseInt(e.target.value);
      let newOpenOrders = [...state.openOrders];
      newOpenOrders[selectedIndex] = {...state.openOrders[selectedIndex]};
      newOpenOrders[selectedIndex].itemsList = [...state.openOrders[selectedIndex].itemsList];
      const itemsList = newOpenOrders[selectedIndex].itemsList;
      for (let i=0; i<itemsList.length; i++) {
        itemsList[i].shippingQuantity = 0;
      }
      console.log(newOpenOrders[selectedIndex])
      return {
        selectedOrderIndex: parseInt(selectedIndex),
        openOrders: newOpenOrders,
      };
    }, 
    ()=> {
      $("#" + this.skuInputId)[0].focus();
    });
  };

  getData = (formId) => {
    var formData = new FormData($("#" + formId)[0]),
        data = {};

    for (var key of formData.keys()) {
      data[key] = formData.get(key);
    }
    return data;
  }

  onSubmit_itemCheck = (e) => {
    e.preventDefault();
    const itemData = this.getData(this.itemCheckFormId);
    let itemsList = this.state.openOrders[this.state.selectedOrderIndex].itemsList,
        index = -1;
    for (let i=0; i<itemsList.length; i++) {
      if (itemsList[i].itemSku == itemData.itemSku) {
        index = i;
        break;
      }
    }
    if (index == -1) {
      window.alert("An incorrect item SKU was entered.");
      $("#" + this.skuInputId).select();
      return;
    }
    if (itemsList[index].pickedQuantity < itemData.quantity) {
      window.alert("The quantity is too large.");
      $("#" + this.quantityInputId).select();
      return;
    }
    this.setState(state => {
      const selectedIndex = state.selectedOrderIndex;
      let newOpenOrders = [...state.openOrders];
      newOpenOrders[selectedIndex] = {...state.openOrders[selectedIndex]};
      newOpenOrders[selectedIndex].itemsList = [...state.openOrders[selectedIndex].itemsList];

      newOpenOrders[selectedIndex].itemsList[index].shippingQuantity = parseInt(itemData.quantity);
      
      this.itemFormReset();
      return {
        openOrders: newOpenOrders,
      };
    });
  };

  createShipment = () => {
    if (this.state.selectedOrderIndex < 0) {
      return;
    }
    let data = {...this.state.openOrders[this.state.selectedOrderIndex]};
    let items = [], item;
    for (let i=0; i<data.itemsList.length; i++) {
      item = data.itemsList[i];
      if (item.shippingQuantity > 0) {
        items.push(item);
      }
    }
    data.shippedItems = items;
    console.log("Ship Data", data);

    const result = window.confirm("Are you sure you want to create a shipment?");
    if (result) {
      this.setState({
        mode: "shipment",
        shippedData: data,
      });
    }
  }

  createOpenOrdersMenu = () => {
    let numOpenItems, totalItems, i, trClass;
    return (
    <div>
      <h2>Open Orders</h2>
      <div id="open-orders-container">
        <table className="table table-sm">
          <thead>
            <tr>
              <th scope="col">Order Name</th>
              <th scope="col">Company Name</th>
              <th scope="col">Transport</th>
              <th scope="col">Unpicked Items</th>
              <th scope="col">Total Items</th>
              <th scope="col">Select</th>
            </tr>
          </thead>
          <tbody>
            {this.state.openOrders.map(((orderPackage, index) => {
              numOpenItems = 0;
              totalItems = 0;
              for (i=0; i<orderPackage.itemsList.length; i++) {
                numOpenItems += orderPackage.itemsList[i].orderedQuantity;
                
                totalItems += orderPackage.itemsList[i].startQuantity;
              }
              trClass = (index == this.state.selectedOrderIndex) ?
                "selected" : "";
              return (
                <tr key={orderPackage.id} className={trClass}>
                  <td>{orderPackage.orderName}</td>
                  <td>{orderPackage.companyName}</td>
                  <td>{orderPackage.transportName}</td>
                  <td>{numOpenItems}</td>
                  <td>{totalItems}</td>
                  <td>
                    <button type="button"
                      value={index} onClick={this.onClick_selectOrder}
                      className="btn btn-sm btn-outline-primary"
                    >Select</button>
                  </td>
                </tr>)
            }))}
          </tbody>
        </table>
      </div>
    </div>
    );
  };

  createAddItemsMenu = () => {
    const disabledInput = this.state.selectedOrderIndex ==  -1;
    return (
    <div>
      <div>
        <h2>
          Items in Order
          <button className="btn btn-outline-primary"
            id="ship-order-btn" onClick={this.createShipment}
            type="button">Create Shipment</button>
        </h2>
        <div id="pickup-items-container">
          {this.createPickupItemsTable()}
        </div>
      </div>
      <div>
        <form onSubmit={this.onSubmit_itemCheck} id={this.itemCheckFormId}>
          <div className="form-group">
            <label htmlFor={this.skuInputId}>SKU</label>
            <input type="text" name="itemSku" className="form-control" 
            id={this.skuInputId} disabled={disabledInput} required></input>
          </div>
          <div className="form-group">
            <label htmlFor={this.quantityInputId}>Quantity</label>
            <input type="number" name="quantity" className="form-control" 
            id={this.quantityInputId} disabled={disabledInput} required></input>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" 
              onChange={this.onChangeClearQuantity} checked={this.state.clearQuantity}
              id="clear-quantity-checkbox" disabled={disabledInput}></input>
            <label className="form-check-label" htmlFor="clear-quantity-checkbox">
              Clear Quantity
            </label>
          </div>
          <button className="btn btn-outline-primary" type="submit">Submit</button>
          <button className="btn btn-outline-secondary" type="button" onClick={this.itemFormReset}>Clear</button>
        </form>
      </div>
    </div>  
    );
  };

  render() {
    if (this.state.mode == "shipment") {
      return (<OrderMenu menu_type={"shipOrder"} data={this.state.shippedData}/>);
    } else {
      return (
        <div>
          {this.createOpenOrdersMenu()}
          {this.createAddItemsMenu()}
        </div>
        );
    }
    
    
  }
}

(function() {
  ReactDOM.render((<ShipOrderApp />), document.getElementById("content-container"));
})();
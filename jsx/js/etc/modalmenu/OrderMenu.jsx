export { OrderMenu }

class OrderMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      warehouses: [],
      // Warehouse option selected
      selectedWarehouseId: null,
      shipmentType: "pallets",
      // pallets reset when shipmentType is changed. Contains dimensions
      pallets: [],
    }
    this.packageFormId = "package-form";
    this.getWarehouses();
  }

  getWarehouses = () => {
    $.ajax({
      url: "/warehouses",
      type: "GET",
      context: this,
      success: function(warehouses) {
        // Check if warehouse Id settings is set under localstorage &
        // set to state.selectedWarehouseId if so
        const wId = storage_obj.getWarehouseId()
        let found = false;
        for (let i=0; i< warehouses.length; i++) {
          if (warehouses[i].id == wId) {
            found = true;
            break;
          }
        }
        this.setState({
          warehouses: warehouses,
          selectedWarehouseId: (found) ? wId : null,
        });
      }
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

  onChange_shipmentType = (e) => {
    this.setState({
      shipmentType: e.target.value,
      pallets: [],
    });
  };

  // Item order 
  CreateReceiverMenu() {
    const shipStatus = this.props.menu_type == "shipOrder";
    const orderName = shipStatus ? this.props.data.orderName : "",
          description = shipStatus ? this.props.data.description : "",
          address1 = shipStatus ? this.props.data.address1 : "",
          address2 = shipStatus ? this.props.data.address2 : "",
          city = shipStatus ? this.props.data.city : "",
          state = shipStatus ? this.props.data.state : "",
          zip = shipStatus ? this.props.data.zip : "",
          contactName = shipStatus ? this.props.data.contactName : "",
          phone = shipStatus ? this.props.data.phone : "",
          companyName = shipStatus ? this.props.data.companyName : "",
          transportName = shipStatus ? this.props.data.transportName : "";
    return (
      <div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="mm-name-input">Order Name</label>
            <input type="text" name="orderName" id="mm-name-input" 
              defaultValue={orderName}
              className="form-control" required />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="mm-desc-input">Description</label>
            <input type="text" name="description" id="mm-desc-input" 
              defaultValue={description} className="form-control" required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="mm-company-input">Company Name</label>
            <input type="text" name="companyName" id="mm-company-input" 
              defaultValue={companyName} className="form-control" required/>
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="mm-contact-input">Contact</label>
            <input type="text" name="contactName" id="mm-contact-input" 
              defaultValue={contactName} className="form-control" required />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="mm-addr1-input">Address 1</label>
          <input type="text" name="address1" id="mm-addr1-input"
            defaultValue={address1} className="form-control" required />
        </div>
        <div className="form-group">
          <label htmlFor="mm-addr2-input">Address 2</label>
          <input type="text" name="address2" id="mm-addr2-input" 
            defaultValue={address2} className="form-control" />
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="mm-city-input">City</label>
            <input type="text" className="form-control" id="mm-input-city" 
              defaultValue={city} name="city" required />
          </div>
          <div className="form-group col-md-4">
            <label htmlFor="mm-state-input">State</label>
            <input type="text" id="mm-state-input" className="form-control"
              defaultValue={state} name="state" required />
          </div>
          <div className="form-group col-md-2">
            <label htmlFor="mm-zip-input">Zip</label>
            <input type="text" className="form-control" id="mm-zip-input"
              defaultValue={zip} name="zip" required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="mm-phone-input">Phone</label>
            <input type="text" name="phone" id="mm-phone-input" 
              defaultValue={phone} className="form-control" required/>
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="mm-transport-input">Transport Name</label>
            <input type="text" name="transportName" id="mm-transport-input" 
              defaultValue={transportName} className="form-control" required />
          </div>
        </div>
      </div>);
  }

  onSubmit_createPackage = (e) => {
    e.preventDefault();
    this.setState(state =>{
      let newPallets = [...state.pallets];
      newPallets.push(
        this.getData(this.packageFormId)
      );
      return { pallets: newPallets };
    });
  };

  createShipmentMenu = () => {
    return (
    <div>
      <div>
        <div>Items</div>
        <table className="table table-sm">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">SKU</th>
              <th scope="col">Description</th>
              <th scope="col">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {this.props.data.shippedItems.map((item, index) => {
              return (<tr key={item.id}>
                <td>{item.itemName}</td>
                <td>{item.itemSku}</td>
                <td>{item.description}</td>
                <td>{item.shippingQuantity}</td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>

      <div className="form-group">
        <label htmlFor="mm-warehouse-select">Warehouse</label>
        <select className="form-control" id="mm-warehouse-select" 
            defaultValue={this.state.selectedWarehouseId}>
          {this.state.warehouses.map(warehouse=> {
            return (<option value={warehouse.id} key={warehouse.id}>
              {warehouse.name} - {warehouse.code} - {warehouse.city}, {warehouse.state}
            </option>)
          })}
        </select>
      </div>

      <div>
        Shipments
        <table>
          <thead>
            <tr>
              <th scope="col">Amount</th>
              <th scope="col">Weight</th>
              <th scope="col">L</th>
              <th scope="col">W</th>
              <th scope="col">H</th>
            </tr>
          </thead>
          <tbody>
            {this.state.pallets.map(p => {
              return (
              <tr>
                <td>{p.amount}</td>
                <td>{p.weight}</td>
                <td>{p.length}</td>
                <td>{p.width}</td>
                <td>{p.height}</td>
              </tr>)
            })}
          </tbody>
        </table>

        <div className="form-row">
          <div className="form-group col-md-4">
            <label htmlFor="ship-type-select">Shipment Type</label>
            <select id="ship-type-select" className="form-control"
                value={this.state.shipmentType} onChange={this.onChange_shipmentType}>
              <option value="pallets">Pallets</option>
              <option value="pallets">pallets</option>
            </select>
          </div>
        </div>
        <div id={this.packageFormId}>
          <div className="form-row">
            <div className="form-group col-md-3">
              <label htmlFor="mm-ship-amount">Amount</label>
              <input type="number" name="amount" id="mm-ship-amount" 
                min="1" className="form-control" required />
            </div>
            <div className="form-group col-md-3">
              <label htmlFor="mm-ship-weight">Weight</label>
              <input type="number" name="weight" id="mm-ship-weight" 
                min="1" className="form-control" required />
            </div>
            <div className="form-group col-md-2">
              <label htmlFor="mm-ship-length">Length</label>
              <input type="number" name="length" id="mm-ship-length" 
                min="1" className="form-control" required />
            </div>
            <div className="form-group col-md-2">
              <label htmlFor="mm-ship-width">Width</label>
              <input type="number" name="width" id="mm-ship-width" 
                min="1" className="form-control" required />
            </div>
            <div className="form-group col-md-2">
              <label htmlFor="mm-ship-height">Height</label>
              <input type="number" name="height" id="mm-ship-height" 
                min="1" className="form-control" required />
            </div>
          </div>
          <button type="submit" onClick={this.onSubmit_createPackage}>
            Add {this.state.shipmentType}</button>
        </div>
      </div>
    </div>);
  };

  render() {
    return(
    <div>
      {this.CreateReceiverMenu()}
      {this.createShipmentMenu()}
    </div>)
  }
}
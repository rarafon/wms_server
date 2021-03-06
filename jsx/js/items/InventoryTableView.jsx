import { TableSearchBar } from "../etc/TableSearchBar.js";

export { InventoryTableView }

class InventoryTableView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itemInventory: [],
    }

    this.editOptions = this.props.type != "ship_items";

    if (this.editOptions) {
      this.loadItemInventory();
    }
    this.tablesearchbar = React.createRef();
  }

  loadItemInventory = () => {
    $.ajax({
      url: "./iteminventory",
      type: "GET",
      context: this,
      success: function(items) {
        console.log(items);
        this.setState({
          itemInventory: items,
        });
      }
    });
  };

  onClick_deleteItem = (e) => {
    const id = e.target.getAttribute("id"),
          index = e.target.getAttribute("index");
    $.ajax({
      url: "/iteminventory/" + id,
      type: "DELETE",
      context: this,
      success: function(data) {
        console.log(data);
      },
      complete: function() {
        this.setState(state => {
          let newList = [...state.itemInventory];
          newList.splice(index, 1);
          return {itemInventory: newList};
        });
      }
    });
  };

  onSearch = (search_type, search_value) => {
    $.ajax({
      url: `/iteminventory?property=${search_type}&value=${search_value}`,
      type: "GET",
      context: this,
      success: function(itemList) {
        this.setState({ itemInventory: itemList });
      },
    });
  };

  render() {
    return (<div>
      <TableSearchBar onSearch={this.onSearch} search_type={"item_inventory"}/>
      <table className="table table-sm">
        <thead>
          <tr>
            <th scope="col">Item Name</th>
            <th scope="col">SKU</th>
            <th scope="col">Available</th>
            <th scope="col">Reserved</th>
            <th scope="col">Shipment Code</th>
            <th scope="col">Location</th>
            <th scope="col">Created Date</th>
            { this.editOptions ? <th scope="col">Options</th> : null}
            
          </tr>
        </thead>
        <tbody>
          {this.state.itemInventory.map((item, index) => {
            return (
            <tr key={item.id}>
              <td>{item.itemName}</td>
              <td>{item.itemSku}</td>
              <td>{item.quantity}</td>
              <td>{item.reservedQuantity}</td>
              <td>{item.shipmentCode}</td>
              <td>{item.locationCode}</td>
              <td>{item.createdDate}</td>
              <td>
                <button type="button"
                  onClick={this.onClick_deleteItem}
                  id={item.id} index={index}
                >Delete</button>
              </td>
            </tr>);
          })}
        </tbody>
      </table>
    </div>);
  }
}
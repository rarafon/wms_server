export {
  TableSearchBar,
}

/**
 * Parameters:
 *  Props
  *  onSearch: onClick method,
  *  search_type : "item_info", "item_receive", "item_inventory"
 */
class TableSearchBar extends React.Component {
  constructor(props) {
    super(props);
  }

  get_search_types = () => {
    switch(this.props.search_type) {
      case "item_info": return [
        { value: "sku", name: "SKU", },
        { value: "name", name: "Name", },
        { value: "description", name: "Description", },
        { value: "category", name: "Category", },
      ];
      case "item_receive": return [
        { value: "itemName", name: "Item Name", },
        { value: "shipmentCode", name: "Shipment Code", },
        { value: "itemSku", name: "Item SKU", },
      ];
      case "item_inventory": return [
        { value: "itemName", name: "Item Name", },
        { value: "sku", name: "SKU", },
        { value: "shipmentCode", name: "Shipment Code", },
        { value: "locationCode", name: "Location", },
      ];
      default: return [];
    }
  }

  onSearch = (e) => {
    e.preventDefault();
    var search_type = document.getElementById("item-search1-type-select").value,
        search_value = document.getElementById("search-bar1-input").value;
    this.props.onSearch(search_type, search_value);
  }

  render() {
    var search_types = this.get_search_types(this.props.search_type);
    return (
    <div className="col-sm-10 col-md-5">
      <form onSubmit={this.onSearch} className="form-inline">
        <input className="form-control" type="text" id="search-bar1-input" autoFocus></input>
        <select className="custom-select" id="item-search1-type-select">
          {search_types.map(search_type=> {
            return (<option key={"search-option-" + search_type.value}
              value={search_type.value}>{search_type.name}</option>);
          })}
        </select>
        <button className="btn btn-outline-secondary"
          type="submit"
          onClick={this.onSearch}>
          Search
        </button>
      </form>
    </div>);
  }
}
import { TableSearchBar } from '../etc/TableSearchBar.js'
import { ModalMenu } from "../etc/modalmenu/ModalMenu.js"
import { ItemInfoRow } from "../components/items/ItemInfoRow.js"

class ItemInfoApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itemInfos: [],
    }
    this.modalMenu = React.createRef();
  }

  add_ref(element) {
    element.ref=React.createRef()
  }

  onSearch = (search_type, search_value) => {
    $.ajax({
      url: "./iteminfo?type=" + search_type + "&value=" + search_value,
      type: "GET",
      context: this,
      success: function(data) {
        console.log(data);
        data.forEach((element) => {
          this.add_ref(element);
        });
        this.setState({itemInfos: data});
      }
    });
  };

  show_itemInfo_barcode = (barcodes) => {
    this.modalMenu.current.show_menu(
      "create_barcode", {barcode_strings: barcodes,});
  }

  update_itemInfoRow = (index) => {
    this.state.itemInfos[index].ref.current.update_data(this.state.itemInfos[index]);
  };

  editItemInfo = (row_index) => {
    this.modalMenu.current.show_menu(
      "edit_item_info",
      this.state.itemInfos[row_index],
      (data) => {
        $.ajax({
          url: "/iteminfo/" + this.state.itemInfos[row_index].id,
          type: "PATCH",
          data: data,
          context: this,
          success: function(new_data) {
            this.setState(prevState => {
              let new_itemInfos = prevState.itemInfos;
              Object.assign(new_itemInfos[row_index], new_data);
            }, ()=>{this.update_itemInfoRow(row_index)});
          },
        });
      }
    )
  };

  create_itemInfo = (data) => {
    console.log(data);
    $.ajax({
      url: "/iteminfo",
      type: "POST",
      data: data,
      context: this,
      success: function(item_data) {
        this.add_ref(item_data);
        this.setState({
          itemInfos: [...this.state.itemInfos, item_data],
        })
      },
      error: function(xhr, textStatus, error) {
        if (xhr.status == 409) {
          window.alert("Item Name already in use");
        } else {
          window.alert(textStatus + " " + error);
        }
      }
    });
  };

  onClick_createItemInfo = () => {
    this.modalMenu.current.show_menu(
      "create_item_info", {}, this.create_itemInfo);
  };

  deleteItemInfo = (row_index, itemInfo_id) => {
    $.ajax({
      url: "/iteminfo/" + itemInfo_id,
      type: "DELETE",
      context: this,
      success: function(return_data) {
        this.state.itemInfos.splice(row_index, 1)
        this.setState({
          itemInfos: this.state.itemInfos,
        });
      },
    });
  }

  get_search_types = () => {
    return [
      {}
    ]
  }

  render() {
    var rows = [];
    if (this.state.itemInfos.length > 0) {
      rows = this.state.itemInfos.map((itemInfo, index) => {
        return (<ItemInfoRow key={"itemInifo-" + itemInfo.id}
          ref={itemInfo.ref}
          deleteItemInfo={this.deleteItemInfo}
          editItemInfo={this.editItemInfo}
          row_index={index}
          data={itemInfo}
          itemName={itemInfo.itemName}
          editItemInfo = {this.editItemInfo}
          show_itemInfo_barcode={this.show_itemInfo_barcode}
        />);
      });   
    }
    return (<div>
      <h1>Item Infos</h1>
      <div className="row justify-content-between">
        <div className="col-1">
          <button onClick={this.onClick_createItemInfo}>+</button>
        </div>
        <TableSearchBar onSearch={this.onSearch} search_type="item_info"/>
      </div>
      <table className="table table-sm">
        <thead>
          <tr>
            <th scope="col">Item Name</th>
            <th scope="col">Descriptions</th>
            <th scope="col">Weight</th>
            <th scope="col">Category</th>
            <th scope="col">[w, l, h]</th>
            <th scope="col">SKUs</th>
            <th scope="col">Options</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
      <ModalMenu ref={this.modalMenu} />
    </div>);
  }
}

function loadReact() {
  ReactDOM.render((
    <ItemInfoApp />
  ), document.getElementById("content-container"));
}

loadReact();
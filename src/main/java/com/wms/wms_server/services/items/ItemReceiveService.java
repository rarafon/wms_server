package com.wms.wms_server.services.items;

import javax.servlet.http.HttpServletRequest;

import com.wms.wms_server.model.items.ItemInfo;
import com.wms.wms_server.model.items.ItemInventory;
import com.wms.wms_server.model.items.ItemReceive;
import com.wms.wms_server.model.response.items.ItemInfoResponse;
import com.wms.wms_server.model.response.items.ItemReceiveResponse;
import com.wms.wms_server.model.shipments.ShipmentReceive;
import com.wms.wms_server.repository.items.ItemReceiveRepository;
import com.wms.wms_server.services.ItemInfoService;
import com.wms.wms_server.services.shipments.ShipmentReceiveService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ItemReceiveService {
    @Autowired
    ItemReceiveRepository itemReceiveRepository;
    @Autowired
    ShipmentReceiveService shipmentReceiveService;
    @Autowired
    ItemInfoService itemInfoService;

    public Boolean check_request(HttpServletRequest request, String parameter) {
        String result = request.getParameter(parameter);
        return (result != null && result.length() > 0);
    }

    public ItemReceive create_itemReceive(HttpServletRequest request) {
        if (check_request(request, "itemSku") && check_request(request, "shipmentCode")
            && check_request(request, "quantity")) {
            ItemInfo itemInfo = itemInfoService.getItemInfoBySku(request.getParameter("itemSku"));
            if (itemInfo == null) {
                return null;
            }
            ShipmentReceive shipment = shipmentReceiveService.get_or_create_shipmentReceive(
                request.getParameter("shipmentCode"));
            ItemReceive itemReceive = new ItemReceive(
                Integer.parseInt(request.getParameter("quantity")),
                request.getParameter("itemSku"),
                shipment,
                itemInfo
            );
            itemReceiveRepository.save(itemReceive);
            return itemReceive;
        }
        return null;
    }

    public List<ItemReceive> searchItemReceive(String property, String value, String value2) {
        if (property.equals("shipmentCode")) {
            return itemReceiveRepository.findByShipmentCode(value);
        } else if (property.equals("itemName")) {
            return itemReceiveRepository.findByItemName(value);
        } else if (property.equals("itemSku")) {
            return itemReceiveRepository.findBySku(value);
        } else if (property.equals("shipmentCodeAndItemSku")) { // Used in Putaway
            return itemReceiveRepository.findByShipmentCodeAndSku(value, value2);
        }
        return new ArrayList<>();
    }

    public List<ItemReceive> searchItemReceive(String property, String value) {
        return searchItemReceive(property, value, "");
    }

    public ItemReceiveResponse convert_to_response(ItemReceive itemReceive) {
        ItemReceiveResponse response = new ItemReceiveResponse();
        response.id = itemReceive.getId();
        response.shipmentCode = itemReceive.getShipmentCode();
        response.quantity = itemReceive.getQuantity();
        response.itemSku = itemReceive.getSku();
        response.setCreatedDate(itemReceive.getCreatedDate());

        ItemInfoResponse infoResponse = itemInfoService.convert_to_response(itemReceive.getItemInfo());
        response.itemInfoResponse = infoResponse;

        return response;
    }

    /**
     * Restore the ItemReceive quantity from ItemInventory (most likely due to deletion
     * of the item).
     * @param itemInventory - itemInventory that is being deleted/ affected.
     * @return
     */
    public ItemReceive restoreItemReceive(ItemInventory itemInventory) {
        ItemReceive itemReceive = itemInventory.getItemReceive();
        itemReceive.setQuantity(itemReceive.getQuantity() + itemInventory.getQuantity() + itemInventory.getReservedQuantity());
        itemReceiveRepository.save(itemReceive);
        return itemReceive;
    }
}
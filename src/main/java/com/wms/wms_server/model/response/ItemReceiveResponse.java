package com.wms.wms_server.model.response;

import com.wms.wms_server.model.response.Response;

import java.util.Date;

import java.text.DateFormat;
import java.util.*;

public class ItemReceiveResponse extends Response {
    public Long id;
    public int quantity;
    public String itemSku;
    public String shipmentCode;

    public ItemInfoResponse itemInfoResponse;

    public String createdDate;

    public void setCreatedDate(Date date) {
        this.createdDate = convertDateToString(date);
    }
}

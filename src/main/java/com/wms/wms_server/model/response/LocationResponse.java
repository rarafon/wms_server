package com.wms.wms_server.model.response;

public class LocationResponse {
    public String area;
    public String loc;
    public int row;
    public int column;
    public int level;

    public LocationResponse(String area, String loc, int row, int column, int level) {
        this.area = area;
        this.loc = loc;
        this.row = row;
        this.column = column;
        this.level = level;
    }
}
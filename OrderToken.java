public class OrderToken implements ModelEntity {
    private String tokenNumber;
    private String outletId;
    private String itemsSummary;
    private double totalAmount;
    private String status; // Pending, Preparing, Ready, Completed

    public OrderToken(String tokenNumber, String outletId, String itemsSummary, double totalAmount, String status) {
        this.tokenNumber = tokenNumber;
        this.outletId = outletId;
        this.itemsSummary = itemsSummary;
        this.totalAmount = totalAmount;
        this.status = status;
    }

    @Override
    public String getId() { return tokenNumber; }

    public String getTokenNumber() { return tokenNumber; }
    public void setTokenNumber(String tokenNumber) { this.tokenNumber = tokenNumber; }

    public String getOutletId() { return outletId; }
    public void setOutletId(String outletId) { this.outletId = outletId; }

    public String getItemsSummary() { return itemsSummary; }
    public void setItemsSummary(String itemsSummary) { this.itemsSummary = itemsSummary; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
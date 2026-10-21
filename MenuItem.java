public class MenuItem implements ModelEntity {
    private String id;
    private String outletId;
    private String name;
    private double price;
    private String category;

    public MenuItem(String id, String outletId, String name, double price, String category) {
        this.id = id;
        this.outletId = outletId;
        this.name = name;
        this.price = price;
        this.category = category;
    }

    @Override
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOutletId() { return outletId; }
    public void setOutletId(String outletId) { this.outletId = outletId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
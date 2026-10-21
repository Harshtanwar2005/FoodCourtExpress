public class Outlet implements ModelEntity {
    private String id;
    private String name;
    private String category;
    private boolean isOpen;

    public Outlet(String id, String name, String category, boolean isOpen) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.isOpen = isOpen;
    }

    @Override
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public boolean isOpen() { return isOpen; }
    public void setOpen(boolean open) { isOpen = open; }
}
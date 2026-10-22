#pragma once
#include <string>
#include <vector>

namespace LostFound {

// Simple User model - only essential fields
struct User {
    int id;
    std::string username;
    std::string email;
    std::string password;
    
    User() : id(0) {}
    User(int uid, std::string uname, std::string mail, std::string pass)
        : id(uid), username(uname), email(mail), password(pass) {}
};

// Simple Item model - clean and focused
struct Item {
    int id;
    std::string type;        // "LOST" or "FOUND"
    std::string name;
    std::string category;
    std::string description;
    std::string location;
    std::string date;
    std::string reporter_email;
    std::string status;      // "OPEN", "MATCHED", "CLOSED"
    std::string photo_url;
    
    Item() : id(0) {}
    Item(int iid, std::string t, std::string n, std::string cat, std::string desc,
         std::string loc, std::string d, std::string email, std::string stat, std::string photo)
        : id(iid), type(t), name(n), category(cat), description(desc),
          location(loc), date(d), reporter_email(email), status(stat), photo_url(photo) {}
};

// Simple Match model for item relationships
struct Match {
    int lost_item_id;
    int found_item_id;
    double score;    // 0.0 to 1.0 confidence score
    std::string date_created;
    
    Match() : lost_item_id(0), found_item_id(0), score(0.0) {}
    Match(int lid, int fid, double s, std::string date)
        : lost_item_id(lid), found_item_id(fid), score(s), date_created(date) {}
};

} // namespace LostFound

using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Text;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using MongoDB.Driver.Builders;

namespace ContextAwareMongoService
{
    // NOTE: You can use the "Rename" command on the "Refactor" menu to change the class name "Service1" in code, svc and config file together.
    // NOTE: In order to launch WCF Test Client for testing this service, please select Service1.svc or Service1.svc.cs at the Solution Explorer and start debugging.
    public class MongoService : IMongoService
    {
        const string CONNECTION_STRING = "mongodb://testuser:testpassword@ds029297.mongolab.com:29297/test-geospatial";
        public bool AddUser(String username, String password)
        {
            MongoUrl url = new MongoUrl(CONNECTION_STRING);
            MongoClient client = new MongoClient(url);
            
            MongoServer server = client.GetServer();
            MongoDatabase db = server.GetDatabase(url.DatabaseName);

            MongoCollection<User> userCol = db.GetCollection<User>("users");
            userCol.FindAllAs<User>();
            long count =  userCol.Find(Query.EQ("Username", username)).Count();
            /*
            // try to see if there already is a user with username=username
            if (count > 0)
            {
                return false;
            }
            else
            {
                userCol.Insert(new User { Username = username, Password = password });
                return true;
            }*/
            return false;
        }

        public bool ValidateUser(String username, String password)
        {
            var client = new MongoClient(CONNECTION_STRING);
            MongoServer server = client.GetServer();
            MongoDatabase db = server.GetDatabase("test-geospatial");
            MongoCollection<User> userCol = db.GetCollection<User>("users");

            return password == userCol.FindOneAs<User>(Query.EQ("username", username)).Password;
        }
    }
}

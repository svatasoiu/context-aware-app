using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Text;

namespace ContextAwareMongoService
{
    // NOTE: You can use the "Rename" command on the "Refactor" menu to change the interface name "IService1" in both code and config file together.
    [ServiceContract]
    public interface IMongoService
    {

        [OperationContract]
        bool AddUser(String username, String password);

        [OperationContract]
        bool ValidateUser(String username, String password);

        // TODO: Add your service operations here
    }

    [DataContract]
    public class User
    {
        string username = "";
        string password = "";

        [DataMember]
        public string Username
        {
            get { return username; }
            set { username = value; }
        }

        [DataMember]
        public string Password
        {
            get { return password; }
            set { password = value; }
        }
    }
}

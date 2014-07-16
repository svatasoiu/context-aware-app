using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Text;

namespace ContextAwareService
{
    // NOTE: You can use the "Rename" command on the "Refactor" menu to change the interface name "IService1" in both code and config file together.
    [ServiceContract]
    public interface IContextService
    {

        [OperationContract]
        bool AddUser(String username, String password);

        [OperationContract]
        [WebInvoke(Method="POST", ResponseFormat=WebMessageFormat.Xml)]
        string GetMeetingsWithinRadius(double lat, double lon, double radius);

        [OperationContract]
        bool ValidateUser(String username, String password);

        // TODO: Add your service operations here
    }

    [DataContract]
    public class User
    {
        [DataMember]
        public string Username
        {
            get;
            set;
        }

        [DataMember]
        public string Password
        {
            get;
            set;
        }
    }
}

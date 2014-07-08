using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Text;
using System.Data;
using System.Data.SqlClient;
using System.Xml.Linq;
using System.Xml.Serialization;
using Newtonsoft.Json;
using Microsoft.SqlServer.Types;

namespace ContextAwareService
{
    // NOTE: You can use the "Rename" command on the "Refactor" menu to change the class name "Service1" in code, svc and config file together.
    // NOTE: In order to launch WCF Test Client for testing this service, please select Service1.svc or Service1.svc.cs at the Solution Explorer and start debugging.
    public class ContextService : IContextService
    {
        public string AddUser(String username, String password)
        {
            
            return username + ": " + password;
        }

        public string GetMeetingsWithinRadius(double lat, double lon, double radius)
        {
            SqlConnection con = new SqlConnection("Server=localhost\\sqlexpress; Database=MeetingsDB; Integrated Security=True;");
            con.Open();
            SqlDataAdapter spatialQuery = new SqlDataAdapter("GetMeetingsWithinRadius", con);

            SqlParameter pointParam = new SqlParameter("@point", SqlDbType.Udt);
            pointParam.UdtTypeName = "Geography";
            pointParam.Value = SqlGeography.Point(lat, lon, 4326);

            SqlParameter radParam = new SqlParameter("@radius", SqlDbType.Float);
            radParam.Value = radius;

            spatialQuery.SelectCommand.Parameters.Add(pointParam);
            spatialQuery.SelectCommand.Parameters.Add(radParam);
            spatialQuery.SelectCommand.CommandType = CommandType.StoredProcedure;

            DataSet res = new DataSet();
            spatialQuery.Fill(res);
            con.Close();

            return JsonConvert.SerializeObject(res, Formatting.None);
        }

        public bool ValidateUser(String username, String password)
        {

            return false;
        }
    }
}

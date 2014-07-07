using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;
using System.Data.SqlClient;
using System.Net;
using System.Xml.Linq;
using Microsoft.SqlServer.Types;

namespace GeocodingSQL
{
    class Program
    {
        private static string APIKEY = "AIzaSyC7UBIn8tiUYIIUEEzylANfIosEfE5c9zc";

        static void Main(string[] args)
        {
            //SqlConnection con = new SqlConnection("<con string>");

            using (SqlConnection con = new SqlConnection("Server=localhost\\sqlexpress; Database=MeetingsDB; Integrated Security=True;"))
            {
                con.Open(); 
                
                SqlServerTypes.Utilities.LoadNativeAssemblies(AppDomain.CurrentDomain.BaseDirectory);
                SqlDataAdapter adapter = new SqlDataAdapter("select MeetingID, Address from Meetings", con);
                DataSet customers = new DataSet();
                adapter.Fill(customers);
                DataTable table = customers.Tables[0];

                foreach (DataRow row in table.Rows)
                {
                    string address = (string)row["Address"];
                    int ID = Int16.Parse(row["MeetingID"].ToString());
                    string requestURL = string.Format("https://maps.googleapis.com/maps/api/geocode/xml?address={0}&key={1}", Uri.EscapeDataString(address), APIKEY);

                    WebRequest request = WebRequest.Create(requestURL);
                    WebResponse response = request.GetResponse();
                    XDocument xdoc = XDocument.Load(response.GetResponseStream());
                    XElement result = xdoc.Element("GeocodeResponse").Element("result");
                    XElement loc = result.Element("geometry").Element("location");
                    double lat = (double) loc.Element("lat");
                    double lng = (double) loc.Element("lng");

                    SqlCommand updateCom = new SqlCommand("UPDATE Meetings SET Location=@loc WHERE MeetingID=@id", con);

                    SqlParameter locParam = new SqlParameter("@loc", SqlDbType.Udt);
                    locParam.UdtTypeName = "Geography";
                    locParam.Value = SqlGeography.Point(lat, lng, 4326);

                    SqlParameter idParam = new SqlParameter("@id", SqlDbType.Int);
                    idParam.Value = ID;

                    updateCom.Parameters.Add(locParam);
                    updateCom.Parameters.Add(idParam);

                    updateCom.ExecuteNonQuery();
                }

                con.Close();
            }
        }
    }
}

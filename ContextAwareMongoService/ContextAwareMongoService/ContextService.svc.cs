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
        public bool AddUser(String username, String password)
        {
            //try
            //{
                Guid guid = System.Guid.NewGuid();
                string hashPassword = HashSHA1(password + guid.ToString());

                SqlConnection con = new SqlConnection(System.Configuration.ConfigurationManager.AppSettings["connString"]);
                using (SqlCommand cmd = new SqlCommand("p_AddUser", con))
                {
                    cmd.Parameters.AddWithValue("@username", username);
                    cmd.Parameters.AddWithValue("@password", hashPassword);
                    cmd.Parameters.AddWithValue("@guid", guid);
                    cmd.CommandType = CommandType.StoredProcedure;

                    con.Open();
                    cmd.ExecuteNonQuery();
                    con.Close();
                }

                return true;
            //}
            //catch (Exception)
            //{
            //    return false;
            //} 
        }

        public string GetMeetingsWithinRadius(double lat, double lon, double radius)
        {
            SqlConnection con = new SqlConnection(System.Configuration.ConfigurationManager.AppSettings["connString"]);
            con.Open();
            SqlDataAdapter spatialQuery = new SqlDataAdapter("p_GetMeetingsWithinRadius", con);

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
            SqlConnection con = new SqlConnection(System.Configuration.ConfigurationManager.AppSettings["connString"]);
            using (SqlDataAdapter cmd = new SqlDataAdapter("p_GetUserByUsername", con))
            {
                cmd.SelectCommand.Parameters.AddWithValue("@username", username);
                cmd.SelectCommand.CommandType = CommandType.StoredProcedure;
                con.Open();
                DataSet res = new DataSet();
                cmd.Fill(res);
                try
                {
                    DataRow dr = res.Tables[0].Rows[0];
                    string dbPass = Convert.ToString(dr["Password"]);
                    string dbUserGUID = Convert.ToString(dr["GUID"]);

                    string hashedPassword = HashSHA1(password + dbUserGUID);
                    if (dbPass == hashedPassword)
                    {
                        return true;
                    }
                }
                catch (Exception)
                {
                    return false;
                }

                con.Close();
            }

            return false;
        }

        private static string HashSHA1(string value)
        {
            var sha1 = System.Security.Cryptography.SHA1.Create();
            var inputBytes = Encoding.ASCII.GetBytes(value);
            var hash = sha1.ComputeHash(inputBytes);

            var sb = new StringBuilder();
            for (var i = 0; i < hash.Length; i++)
            {
                sb.Append(hash[i].ToString("X2"));
            }
            return sb.ToString();
        }
    }
}

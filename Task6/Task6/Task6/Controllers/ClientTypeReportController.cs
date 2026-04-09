using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Task6.Models;

namespace Task6.Controllers
{
    public class ClientTypeReportController : ApiController
    {

        private readonly string connectionString = ConfigurationManager.ConnectionStrings["DeviceDB"].ConnectionString;

        [HttpGet]
        [Route("api/reports/client-count-by-type")]
        public IHttpActionResult GetClientCountByType(int? type = null)
        {
            var result = new List<ClientTypeReport>();
            using (var conn = new SqlConnection(connectionString))
            using (var cmd = new SqlCommand("GetClientCountByType", conn))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Type", (object)type ?? DBNull.Value);
                conn.Open();
                var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    result.Add(new ClientTypeReport
                    {
                        Type = (int)reader["Type"],
                        TypeName = reader["TypeName"].ToString(),
                        ClientCount = (int)reader["ClientCount"]
                    });
                }
            }
            return Ok(result);
        }
    }
}

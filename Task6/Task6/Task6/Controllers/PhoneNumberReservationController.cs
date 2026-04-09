using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Task6.Controllers
{
    [RoutePrefix("api/reservations")]
    public class PhoneNumberReservationController : ApiController
    {
        string connectionString = ConfigurationManager.ConnectionStrings["DeviceDB"].ConnectionString;

        [HttpGet]
        [Route("get")]
        public IHttpActionResult GetReservations(int? clientId = null, int? phoneNumberId = null)
        {
            List<object> reservations = new List<object>();
            using (SqlConnection conn = new SqlConnection(connectionString))
            using (SqlCommand cmd = new SqlCommand("sp_GetPhoneNumberReservations", conn))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ClientID", (object)clientId ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@PhoneNumberID", (object)phoneNumberId ?? DBNull.Value);

                conn.Open();
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        reservations.Add(new
                        {
                            ID = reader.GetInt32(0),
                            ClientName = reader.GetString(1),
                            PhoneNumber = reader.GetString(2),
                            BED = reader.GetDateTime(3),
                            EED = reader.IsDBNull(4) ? (DateTime?)null : reader.GetDateTime(4)
                        });
                    }
                }
            }
            return Ok(reservations);
        }
    }
}

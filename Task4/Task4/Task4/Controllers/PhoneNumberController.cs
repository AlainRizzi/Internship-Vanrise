using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Task4.Models;

namespace Task4.Controllers
{
    public class PhoneNumberController : ApiController
    {
        string connectionString = ConfigurationManager.ConnectionStrings["DeviceDB"].ConnectionString;

        [HttpGet]
        [Route("api/phones")]
        public IEnumerable<PhoneNumbers> GetAll()
        {
            var list = new List<PhoneNumbers>();
            using (SqlConnection conn = new SqlConnection(connectionString))
            using (SqlCommand cmd = new SqlCommand("GetAllPhoneNumbers", conn))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                conn.Open();
                var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    list.Add(new PhoneNumbers
                    {
                        ID = (int)reader["ID"],
                        Number = reader["Number"].ToString(),
                        DeviceID = (int)reader["DeviceID"],
                        DeviceName = reader["DeviceName"].ToString()
                    });
                }
            }
            return list;
        }

        [HttpGet]
        [Route("api/phones/filter")]
        public IEnumerable<PhoneNumbers> GetFiltered(string number = null, int? deviceID = null)
        {
            var list = new List<PhoneNumbers>();
            using (SqlConnection conn = new SqlConnection(connectionString))
            using (SqlCommand cmd = new SqlCommand("GetFilteredPhoneNumbers", conn))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Number", (object)number ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@DeviceID", (object)deviceID ?? DBNull.Value);

                conn.Open();
                var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    list.Add(new PhoneNumbers
                    {
                        ID = (int)reader["ID"],
                        Number = reader["Number"].ToString(),
                        DeviceID = (int)reader["DeviceID"],
                        DeviceName = reader["DeviceName"].ToString()
                    });
                }
            }
            return list;
        }

        [HttpPost]
        [Route("api/phones")]
        public IHttpActionResult Add(PhoneNumbers phone)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            using (SqlCommand cmd = new SqlCommand("AddPhoneNumber", conn))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Number", phone.Number);
                cmd.Parameters.AddWithValue("@DeviceID", phone.DeviceID);
                conn.Open();
                cmd.ExecuteNonQuery();
            }
            return Ok();
        }

        [HttpPut]
        [Route("api/phones/{id}")]
        public IHttpActionResult Update(int id, PhoneNumbers phone)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            using (SqlCommand cmd = new SqlCommand("UpdatePhoneNumber", conn))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ID", id);
                cmd.Parameters.AddWithValue("@Number", phone.Number);
                cmd.Parameters.AddWithValue("@DeviceID", phone.DeviceID);
                conn.Open();
                cmd.ExecuteNonQuery();
            }
            return Ok();
        }
    }
}

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
    [RoutePrefix("api/clients")]
    public class ClientController : ApiController
    {
        private readonly string connectionString = ConfigurationManager.ConnectionStrings["DeviceDB"].ConnectionString;

        // 1. Get all clients
        [HttpGet]
        [Route("")]
        public IHttpActionResult GetAllClients()
        {
            List<Client> clients = new List<Client>();

            using (SqlConnection conn = new SqlConnection(connectionString))
            using (SqlCommand cmd = new SqlCommand("GetAllClients", conn))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                conn.Open();

                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    clients.Add(new Client
                    {
                        ID = Convert.ToInt32(reader["ID"]),
                        Name = reader["Name"].ToString(),
                        Type = (ClientType)Convert.ToInt32(reader["Type"]),
                        BirthDate = reader["BirthDate"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(reader["BirthDate"])
                    });
                }
                reader.Close();
            }

            return Ok(clients);
        }

        // 2. Get filtered clients
        [HttpGet]
        [Route("filter")]
        public IHttpActionResult GetFilteredClients(string name = null, int? type = null)
        {
            List<Client> clients = new List<Client>();

            using (SqlConnection conn = new SqlConnection(connectionString))
            using (SqlCommand cmd = new SqlCommand("GetFilteredClients", conn))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Name", (object)name ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Type", (object)type ?? DBNull.Value);

                conn.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    clients.Add(new Client
                    {
                        ID = Convert.ToInt32(reader["ID"]),
                        Name = reader["Name"].ToString(),
                        Type = (ClientType)Convert.ToInt32(reader["Type"]),
                        BirthDate = reader["BirthDate"] == DBNull.Value ? null : (DateTime?)Convert.ToDateTime(reader["BirthDate"])
                    });
                }
                reader.Close();
            }

            return Ok(clients);
        }

        // 3. Add a new client
        [HttpPost]
        [Route("")]
        public IHttpActionResult AddClient(Client client)
        {
            if (client == null || string.IsNullOrWhiteSpace(client.Name))
                return BadRequest("Invalid client data.");

            using (SqlConnection conn = new SqlConnection(connectionString))
            using (SqlCommand cmd = new SqlCommand("AddClient", conn))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Name", client.Name);
                cmd.Parameters.AddWithValue("@Type", (int)client.Type);
                cmd.Parameters.AddWithValue("@BirthDate", (object)client.BirthDate ?? DBNull.Value);

                conn.Open();
                cmd.ExecuteNonQuery();
            }

            return Ok("Client added successfully.");
        }

        // 4. Update existing client
        [HttpPut]
        [Route("{id:int}")]
        public IHttpActionResult UpdateClient(int id, Client client)
        {
            if (client == null || string.IsNullOrWhiteSpace(client.Name))
                return BadRequest("Invalid client data.");

            using (SqlConnection conn = new SqlConnection(connectionString))
            using (SqlCommand cmd = new SqlCommand("UpdateClient", conn))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@ID", id);
                cmd.Parameters.AddWithValue("@Name", client.Name);
                cmd.Parameters.AddWithValue("@Type", (int)client.Type);
                cmd.Parameters.AddWithValue("@BirthDate", (object)client.BirthDate ?? DBNull.Value);

                conn.Open();
                cmd.ExecuteNonQuery();
            }

            return Ok("Client updated successfully.");
        }
    }
}

using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Task7.Models;

namespace Task7.Controllers
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
        [HttpDelete]
        [Route("{id:int}")]
        public HttpResponseMessage DeleteClient(int id)
        {
            try
            {
                using (SqlConnection con = new SqlConnection(connectionString))
                {
                    SqlCommand cmd = new SqlCommand("DeleteClient", con);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@ID", id);

                    con.Open();
                    cmd.ExecuteNonQuery();
                }

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (SqlException ex)
            {
                if (ex.Message.Contains("Client has active phone number reservations"))
                {
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Client has active phone number reservations.");
                }

                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex);
            }
        }
        [HttpPost]
        [Route("reserve")]
        public IHttpActionResult ReservePhoneNumber(ReservationDto dto)
        {
            using (var con = new SqlConnection(connectionString))
            using (var cmd = new SqlCommand("ReservePhoneNumber", con))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ClientID", dto.ClientID);
                cmd.Parameters.AddWithValue("@PhoneNumberID", dto.PhoneNumberID);

                con.Open();
                cmd.ExecuteNonQuery();
                return Ok();
            }
        }

        [HttpPost]
        [Route("unreserve")]
        public IHttpActionResult UnreservePhoneNumber(ReservationDto dto)
        {
            using (var con = new SqlConnection(connectionString))
            using (var cmd = new SqlCommand("UnreservePhoneNumber", con))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ClientID", dto.ClientID);
                cmd.Parameters.AddWithValue("@PhoneNumberID", dto.PhoneNumberID);

                con.Open();
                cmd.ExecuteNonQuery();
                return Ok();
            }
        }

        public class ReservationDto
        {
            public int ClientID { get; set; }
            public int PhoneNumberID { get; set; }
        }

        [HttpGet]
        [Route("GetAvailablePhoneNumbers")]
        public IHttpActionResult GetAvailablePhoneNumbers()
        {
            using (SqlConnection con = new SqlConnection(connectionString))
            using (SqlCommand cmd = new SqlCommand("GetAvailablePhoneNumbers", con))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                con.Open();
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    var result = new List<object>();
                    while (reader.Read())
                    {
                        result.Add(new
                        {
                            ID = (int)reader["ID"],
                            Number = (string)reader["Number"],
                            DeviceID = (int)reader["DeviceID"]
                        });
                    }
                    return Ok(result);
                }
            }
        }

        [HttpGet]
        [Route("GetReservedPhoneNumbers/{clientId}")]
        public IHttpActionResult GetReservedPhoneNumbers(int clientId)
        {
            var list = new List<PhoneNumbers>();
            using (var con = new SqlConnection(connectionString))
            using (var cmd = new SqlCommand("GetReservedPhoneNumbersByClient", con))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ClientID", clientId);

                con.Open();
                var rd = cmd.ExecuteReader();
                while (rd.Read())
                {
                    list.Add(new PhoneNumbers
                    {
                        ID = (int)rd["ID"],
                        Number = (string)rd["Number"]
                    });
                }
            }
            return Ok(list);
        }

        [HttpGet]
        [Route("HasActiveReservation/{clientId}")]
        public IHttpActionResult HasActiveReservation(int clientId)
        {
            bool result = false;

            using (var con = new SqlConnection(connectionString))
            using (var cmd = new SqlCommand("HasActiveReservation", con))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ClientID", clientId);
                con.Open();

                var reader = cmd.ExecuteReader();
                if (reader.Read())
                {
                    result = (bool)reader["HasActiveReservation"];
                }
            }

            return Ok(result);
        }

    }
}

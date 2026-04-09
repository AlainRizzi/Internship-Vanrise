using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Task7.Models
{
    public class Client
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public ClientType Type { get; set; }
        public DateTime? BirthDate { get; set; }
    }

    public enum ClientType
    {
        Individual = 0,
        Organization = 1
    }
}
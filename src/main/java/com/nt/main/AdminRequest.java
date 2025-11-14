package com.nt.main;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/request")
public class AdminRequest extends HttpServlet{
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
     PrintWriter pw=res.getWriter();
     res.setContentType("text/html");
     try {
    	 Class.forName("oracle.jdbc.driver.OracleDriver");
    	 Connection con=DriverManager.getConnection("jdbc:oracle:thin:@localhost:1521:orcl","proj","hk");
    
    	 //................................................................................................................
    	 
    	
    	 
    	 pw.println("<!DOCTYPE html>\r\n"
    	 		+ "<html lang=\"en\" >\r\n"
    	 		+ "<head>\r\n"
    	 		+ "  <meta charset=\"UTF-8\">\r\n"
    	 		+ "  <link rel=\"icon\" href=\"hostel.jpeg\" style=\"background-color: white;\">\r\n"
    	 		+ "  <title>SGGS Hostel Portal</title>\r\n"
    	 		+ "  <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/normalize/5.0.0/normalize.min.css\">\r\n"
    	 		+ "  <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css\" >\r\n"
    	 		+ "  <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\r\n"
    	 		+ "<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\r\n"
    	 		+ "<link href=\"https://fonts.googleapis.com/css2?family=Lobster&family=Roboto+Slab:wght@400;500&display=swap\" rel=\"stylesheet\">\r\n"
    	 		+ "  <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\r\n"
    	 		+ "<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\r\n"
    	 		+ "<link href=\"https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;500&display=swap\" rel=\"stylesheet\">\r\n"
    	 		+ "  <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\r\n"
    	 		+ "<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\r\n"
    	 		+ "<link href=\"https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@500&display=swap\" rel=\"stylesheet\"\r\n"
    	 		+ "integrity=\"sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA==\" crossorigin=\"anonymous\" referrerpolicy=\"no-referrer\" />\r\n"
    	 		+ "<link rel=\"stylesheet\" href=\"request.css\">\r\n"
    	 		+ "<script src=\"https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.5.0/Chart.min.js\"></script>\r\n"
    	 		+ "\r\n"
    	 		+ "\r\n"
    	 		+ "\r\n"
    	 		+ "</head>\r\n"
    	 		+ "<body>\r\n"
    	 		+ "<!-- partial:index.partial.html -->\r\n"
    	 		+ "<div class=\"top\">\r\n"
    	 		+ "\r\n"
    	 		+ "  <div class=\"header\">\r\n"
    	 		+ "    <img src=\"collage_logo.png\" alt=\"logo\" />\r\n"
    	 		+ "    <h1>SHRI GURU GOBIND SINGHJI <br> INSTITUTE OF ENGINEERING AND TECHNOLOGY, <br> VISHNUPURI, NANDED : 431606  <br><span class=\"font_header\">(An Autonomous Institute Owned by Government of Maharashtra)</span>\r\n"
    	 		+ "     <br>\r\n"
    	 		+ "    <br ></h1>\r\n"
    	 		+ "  </div>\r\n"
    	 		+ "</div>\r\n"
    	 		+ "<div class=\"mains\">\r\n"
    	 		+ "  \r\n"
    	 		+ "    <div class=\"left\">\r\n"
    	 		+ "        <h3>Admin Pannel</h3>\r\n"
    	 		+ "        \r\n"
    	 		+ "        <div class=\"line\">\r\n"
    	 		+ "          <i class=\"fa-solid fa-code-pull-request\"></i>\r\n"
    	 		+ "          <a class=\"side_h\" style=\"display: inline; \" href=\"/HostelManagementSystem/request\">Request </a>\r\n"
    	 		+ "        </div>\r\n"
    	 		+ "        \r\n"
    	 		+ "        <div class=\"line\">\r\n"
    	 		+ "          <i class=\"fa-solid fa-address-card\"></i>\r\n"
    	 		+ "          <a class=\"side_h\" style=\"display: inline;\" href=\"/HostelManagementSystem/registration\">Registration</a>\r\n"
    	 		+ "        </div>\r\n"
    	 		+ "        <div class=\"line\">\r\n"
    	 		+ "          <i class=\"fa-solid fa-person\"></i>\r\n"
    	 		+ "          <a class=\"side_h\" style=\"display: inline;\" href=\"/HostelManagementSystem/students\">&nbsp;Students</a>\r\n"
    	 		+ "        </div>\r\n"
    	 		+ "        <div class=\"line\">\r\n"
    	 		+ "          <i class=\"fa-solid fa-gear\"></i>\r\n"
    	 		+ "          <a class=\"side_h\" style=\"display: inline;\" href=\"setting.html\">Settings</a>\r\n"
    	 		+ "        </div>\r\n"
    	 		+ "        <div class=\"line\">\r\n"
    	 		+ "          <i class=\"fa-solid fa-right-from-bracket\"></i>\r\n"
    	 		+ "          <a class=\"side_h\" style=\"display: inline;\" href=\"/HostelManagementSystem/index.html\">Log Out</a>\r\n"
    	 		+ "        </div>\r\n"
    	 		+ "      <hr>\r\n"
    	 		+ "      <a class=\"side_a\" href=\"#\"><br>Rules and regulations</a>\r\n"
    	 		+ "      <br>\r\n"
    	 		+ "      \r\n"
    	 		+ "      \r\n"
    	 		+ "     \r\n"
    	 		+ "  </div>\r\n"
    	 		+ "    <div class=\"other\">\r\n"
    	 		+ "      <div class=\"app\">\r\n"
    	 		+ "        <div class=\"left_app\">\r\n"
    	 		+ "          <h2>Leave Application</h2>\r\n"
    	 		+ "        </div>\r\n"
    	 		+ "        <div class=\"right_app\">\r\n"
    	 		+ "          <h2>Complaints</h2>\r\n"
    	 		+ "        </div>\r\n"
    	 		+ "      </div>\r\n"
    	 		+ "     \r\n"
    	 		+ "      <div class=\"tables\">\r\n"
    	 		+ "      <div class=\"application\">\r\n"
    	 		+ "        <table>\r\n"
    	 		+ "          <thead>\r\n"
    	 		+ "              <tr>\r\n"
    	 		+ "                  <th class=\"sr-no\">Sr No</th>\r\n"
    	 		+ "                  <th class=\"reg-no\">Reg No</th>\r\n"
    	 		+ "                  <th class=\"extra\">Name</th>\r\n"
    	 		+ "                  <th class=\"date\">Depart Date</th>\r\n"
    	 		+ "                  <th class=\"date\">Arrival Date</th>\r\n"
    	 		+ "                  <th class=\"reason\">Reason</th>\r\n"
    	 		+ "                  \r\n"
    	 		+ "              </tr>\r\n"
    	 		+ "          </thead>\r\n"
    	 		+ "          <tbody>\r\n");
    	 PreparedStatement ps=con.prepareStatement("SELECT ROWNUM, LA.REGNO, US.F_NAME, US.L_NAME, LA.DEPART_DATE, LA.ARRIVAL_DATE, LA.REASON FROM LEAVEAPPLICATION LA INNER JOIN USER_STUDENTS US ON LA.REGNO=US.REG_NO");
    	 ResultSet rs=ps.executeQuery();
    	 while(rs.next()) {
    		 String rownum=rs.getString(1);
    		 String regno=rs.getString(2);
    		 String fname=rs.getString(3);
    		 String lname=rs.getString(4);
    		 String name=fname+" "+lname;
    		 String departDate[]=rs.getString(5).split(" ");
    		 String arrivalDate[]=rs.getString(6).split(" ");
    		 String reason=rs.getString(7);
    		
    	 
    	 
    	        pw.println(
    	 		 "            <!-- repeat  -->\r\n"
    	 		+ "              <tr>\r\n"
    	 		+ "                  <td>"+rownum+"</td>\r\n"
    	 		+ "                  <td>"+regno+"</td>\r\n"
    	 		+ "                  <td >"+name+"</td>\r\n"
    	 		+ "                  <td class=\"date\">"+departDate[0]+"</td>\r\n"
    	 		+ "                  <td class=\"date\">"+arrivalDate[0]+"</td>\r\n"
    	 		+ "                  <td class=\"reason\">\r\n"
    	 		+ "                    "+reason+"\r\n"
    	 		+ "                  </td>\r\n");
    	 }
    	        pw.println(
    	 		 "                  \r\n"
    	 		+ "              <!-- Add more rows as needed -->\r\n"
    	 		+ "          </tbody>\r\n"
    	 		+ "      </table>\r\n"
    	 		+ "  </body>\r\n"
    	 		+ "      </div>\r\n"
    	 		+ "\r\n"
    	 		+ "      <div class=\"complaint\">\r\n"
    	 		+ "        <table class=\"data-table\">\r\n"
    	 		+ "          <thead>\r\n"
    	 		+ "              <tr>\r\n"
    	 		+ "                  <th class=\"sr-no\">Sr No</th>\r\n"
    	 		+ "                  <th class=\"room-no\">Room No</th>\r\n"
    	 		+ "                  <th class=\"subject\">Subject</th>\r\n"
    	 		+ "                  <th class=\"description\">Description</th>\r\n"
    	 		+ "                  <th class=\"date\">Asign Date</th>\r\n"
    	 		+ "                  <th class=\"status\">Status</th>\r\n"
    	 		+ "              </tr>\r\n"
    	 		+ "          </thead>\r\n"
    	 		+ "          <tbody>\r\n"
    	 		+ "            <!--   repeat   -->\r\n");
    	        
    	        PreparedStatement ps1=con.prepareStatement("SELECT ROWNUM,  ROOM_NO, COMPLAINT_TYPE, DESCRIPTION, ASSIGN_DATE FROM COMPLAINT");
    	    	 ResultSet rs1=ps1.executeQuery();
    	    	 while(rs1.next()) {
    	    		 String rownum=rs1.getString(1);
    	    		 String roomNo=rs1.getString(2);
    	    		 String complaintType=rs1.getString(3);
    	    		 String description=rs1.getString(4);
    	    		 String date[]=rs1.getString(5).split(" ");
    	    	
    	    	 
    	        pw.println(
    	 		 "              <tr>\r\n"
    	 		+ "                  <td>"+rownum+"</td>\r\n"
    	 		+ "                  <td>"+roomNo+"</td>\r\n"
    	 		+ "                  <td class=\"subject\">"+complaintType+"</td>\r\n"
    	 		+ "                  <td class=\"description\">"+description+"</td>\r\n"
    	 		+ "                  <td class=\"assign-date\">"+date[0]+"</td>\r\n"
    	 		+ "                \r\n"
    	 		+ "                  <td class=\"status\" style=\"color: green;\">-</td>\r\n"
    	 		+ "              </tr>\r\n"
    	 		+ "              \r\n");
    	    	 }
    	        pw.println(
    	 		 "              <!-- Add more rows as needed -->\r\n"
    	 		+ "          </tbody>\r\n"
    	 		+ "      </table>\r\n"
    	 		+ "      </div>\r\n"
    	 		+ "    </div>\r\n"
    	 		+ "\r\n"
    	 		+ "\r\n"
    	 		+ "  </div>\r\n"
    	 		+ "\r\n"
    	 		+ "</div>\r\n"
    	 		+ "\r\n"
    	 		+ "\r\n"
    	 		+ "<!-- partial -->\r\n"
    	 		+ "  \r\n"
    	 		+ "</body>\r\n"
    	 		+ "</html>");
    	 
     }catch(Exception e) {
    	 e.printStackTrace();
     }

	}

	@Override
	public void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		doGet(req,res);
	}

}

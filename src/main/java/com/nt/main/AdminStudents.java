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

@WebServlet("/students")
public class AdminStudents extends HttpServlet {
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
	PrintWriter pw=res.getWriter();
	res.setContentType("text/html");
	try {
		Class.forName("oracle.jdbc.driver.OracleDriver");
		Connection con=DriverManager.getConnection("jdbc:oracle:thin:@localhost:1521:orcl","proj","hk");
		
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
				+ "<link rel=\"stylesheet\" href=\"student.css\">\r\n"
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
				+ "       \r\n"
				+ "          <div class=\"line\">\r\n"
				+ "            <i class=\"fa-solid fa-code-pull-request\"></i>\r\n"
				+ "            <a class=\"side_h\" style=\"display: inline; \" href=\"/HostelManagementSystem/request\">Request </a>\r\n"
				+ "          </div>\r\n"
				+ "         \r\n"
				+ "          <div class=\"line\">\r\n"
				+ "            <i class=\"fa-solid fa-address-card\"></i>\r\n"
				+ "            <a class=\"side_h\" style=\"display: inline;\" href=\"/HostelManagementSystem/registration\">Registration</a>\r\n"
				+ "          </div>\r\n"
				+ "          <div class=\"line\">\r\n"
				+ "            <i class=\"fa-solid fa-person\"></i>\r\n"
				+ "            <a class=\"side_h\" style=\"display: inline;\" href=\"/HostelManagementSystem/students\">&nbsp;Students</a>\r\n"
				+ "          </div>\r\n"
				+ "          <div class=\"line\">\r\n"
				+ "            <i class=\"fa-solid fa-gear\"></i>\r\n"
				+ "            <a class=\"side_h\" style=\"display: inline;\" href=\"setting.html\">Settings</a>\r\n"
				+ "          </div>\r\n"
				+ "          <div class=\"line\">\r\n"
				+ "            <i class=\"fa-solid fa-right-from-bracket\"></i>\r\n"
				+ "            <a class=\"side_h\" style=\"display: inline;\" href=\"/HostelManagementSystem/index.html\">Log Out</a>\r\n"
				+ "          </div>\r\n"
				+ "        <hr>\r\n"
				+ "        <a class=\"side_a\" href=\"#\"><br>Rules and regulations</a>\r\n"
				+ "        <br>\r\n"
				+ "        \r\n"
			
				+ "       \r\n"
				+ "    </div>\r\n"
				+ "    <div class=\"other\">\r\n"
				+ "        <div class=\"select\">\r\n"
				+ "        <div class=\"year\">\r\n"
				);
		
		    
			    pw.println(
				 "        </div>\r\n"
				+ "       \r\n"
				
			
				+ "    </div>\r\n"
				+ "        <div class=\"student_table\">\r\n"
				+ "            <table id=\"studentTable\">\r\n"
				+ "                <thead>\r\n"
				+ "                    <tr>\r\n"
				+ "                        <th class=\"sr-no\">sr no</th>\r\n"
				+ "                        <th class=\"name\">Name</th>\r\n"
				+ "                        <th class=\"reg-no\">Reg no</th>\r\n"
				+ "                        <th class=\"s_year\">Year</th>\r\n"
				+ "                        <th class=\"s_branch\">Branch</th>\r\n"
				+ "                        <th class=\"mob-no\">Mob No</th>\r\n"
				+ "                        <th class=\"room-no\">Room no</th>\r\n"
				+ "                    </tr>\r\n"
				+ "                </thead>\r\n"
				+ "                <tbody>\r\n"
				+ "                    <!-- Sample student data, you can replace this with your data -->\r\n");
		PreparedStatement ps=con.prepareStatement("SELECT ROWNUM, USER_STUDENTS.F_NAME, USER_STUDENTS.L_NAME, STUDENTS.REG_NO, STUDENTS.YEAR, USER_STUDENTS.BRANCH, USER_STUDENTS.PHONE, STUDENTS.ROOM_NO FROM STUDENTS INNER JOIN USER_STUDENTS ON USER_STUDENTS.REG_NO=STUDENTS.REG_NO");
		ResultSet rs=ps.executeQuery();
		while(rs.next()) {
			String rownum=rs.getString(1);
			String fname=rs.getString(2);
			String lname=rs.getString(3);
			String name=fname+" "+lname;
			String regno=rs.getString(4);
			String year=rs.getString(5);
			String branch=rs.getString(6);
			String phone=rs.getString(7);
			String roomno=rs.getString(8);
			
		
		        pw.println(
				 "                    <tr>\r\n"
				+ "                        <td>"+rownum+"</td>\r\n"
				+ "                        <td>"+name+"</td>\r\n"
				+ "                        <td>"+regno+"</td>\r\n"
				+ "                        <td>"+year+"</td>\r\n"
				+ "                        <td>"+branch+"</td>\r\n"
				+ "                        <td>"+phone+"</td>\r\n"
				+ "                        <td>"+roomno+"</td>\r\n"
				+ "                    </tr>\r\n");
		}
		        pw.println(
				 "                   \r\n"
				+ "                </tbody>\r\n"
				+ "            </table>\r\n"
				+ "        </div>\r\n"
				+ "    </div>\r\n"
				+ "  </div>\r\n"
				+ "</div>  \r\n"
				+ "</body>\r\n"
				+ "</html>");
	}catch(Exception e) {
		e.printStackTrace();
	}
	}
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		doGet(req, res);
	}

}

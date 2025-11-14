package com.nt.main;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/usercomplaint")
public class UserComplaint extends HttpServlet {
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		PrintWriter pw=res.getWriter();
    	res.setContentType("text/html");
    	pw.println("user complaint");
    	String roomNo=req.getParameter("room_no").toUpperCase();
    	String complaintType=req.getParameter("complaint_type");
    	String description =req.getParameter("description");
    	String date=req.getParameter("assigned_date");
    	
    	pw.println(roomNo);
    	pw.println(complaintType);
    	pw.println(description);
    	pw.println(date);
    	
    	try {
            Class.forName("oracle.jdbc.driver.OracleDriver");
            Connection con=DriverManager.getConnection("jdbc:oracle:thin:@localhost:1521:orcl","proj","hk");
            PreparedStatement ps=con.prepareStatement("INSERT INTO COMPLAINT VALUES(?,?,?,SYSDATE)");
            ps.setString(1, roomNo);
            ps.setString(2, complaintType);
            ps.setString(3, description);
           
            int count=ps.executeUpdate();
            if(count==1) {
            	res.sendRedirect("success.html");
            }
            pw.print(count);
            con.close();
	}catch(Exception e) {
		e.printStackTrace();
		res.sendRedirect("InvalidCredentials.html");
	}
    	
    	
    	
	}
	@Override
	public void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		doGet(req, res);
	}
}

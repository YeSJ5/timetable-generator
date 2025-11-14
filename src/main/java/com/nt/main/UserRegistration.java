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

@WebServlet("/userregistration")
public class UserRegistration extends HttpServlet {
    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
    	PrintWriter pw=res.getWriter();
    	res.setContentType("text/html");
    	pw.println("user registration");
    	String regno=req.getParameter("regno").toUpperCase();
    	String purpose =req.getParameter("purpose");
    	String year=req.getParameter("year");
    	String address=req.getParameter("address");
    	pw.println(regno);
    	pw.println(purpose);
    	pw.println(year);
    	pw.println(address);
    	try {
                Class.forName("oracle.jdbc.driver.OracleDriver");
                Connection con=DriverManager.getConnection("jdbc:oracle:thin:@localhost:1521:orcl","proj","hk");
                PreparedStatement ps=con.prepareStatement("INSERT INTO REGISTRATION VALUES(?,?,?,?)");
                ps.setString(1, regno);
                ps.setString(2,year);
                ps.setString(3, address);
                ps.setString(4, purpose);
                int count=ps.executeUpdate();
                if(count==1) {
                	res.sendRedirect("success.html");
                }
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
